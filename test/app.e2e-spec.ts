import { Test, TestingModule } from '@nestjs/testing';
import {
  Global,
  INestApplication,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { i18nValidationErrorFactory } from 'nestjs-i18n';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { MySQLProviderModule } from '../src/providers/database/mysql/mysql-provider.module';
import { AppConfigService } from '../src/config/app/app-config.service';
import { XdrEntities } from '../src/providers/database/xdr-entities';
import { WebsiteAccountService } from '../src/modules/account/services/website-account.service';
import { SessionService } from '../src/modules/auth/services/session.service';
import { TokenService } from '../src/modules/auth/services/token.service';
import { AuditLogService } from '../src/modules/audit/audit-log.service';
import { PermissionService } from '../src/modules/permission/permission.service';
import { WebsiteSettingsService } from '../src/modules/setting/services/website-settings.service';

class TestDataSource extends DataSource {
  public async loadMetadata(): Promise<void> {
    await this.buildMetadatas();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        const source = new TestDataSource({
          type: 'mysql',
          database: 'xdr_test',
          entities: XdrEntities,
        });
        await source.loadMetadata();
        return source;
      },
    },
  ],
  exports: [DataSource],
})
class TestDatabaseModule {}

describe('NestJS migration smoke tests (no external database)', () => {
  let app: INestApplication;
  const findById = jest.fn();
  const activeSession = jest.fn();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MySQLProviderModule)
      .useModule(TestDatabaseModule)
      .overrideProvider(WebsiteAccountService)
      .useValue({ findById })
      .overrideProvider(SessionService)
      .useValue({ activeSession })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: i18nValidationErrorFactory,
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('loads application configuration through Joi Standard Schema', () => {
    expect(app.get(AppConfigService).name).toBeTruthy();
  });

  it('documents only the active XDR routes', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    expect(document.paths['/articles/available'].get).toBeDefined();
    expect(document.paths['/auth/login'].post).toBeDefined();
    for (const [path, schema] of [
      ['/account', 'AccountSummaryResponseDto'],
      ['/auth/me', 'CurrentAccountResponseDto'],
    ]) {
      expect(document.paths[path].get.responses['200']).toEqual(
        expect.objectContaining({
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/${schema}`,
              },
            },
          },
        }),
      );
    }
    expect(document.paths['/settings/public'].get).toBeDefined();
    expect(document.paths['/account/acp-access'].get.responses['200']).toEqual(
      expect.objectContaining({
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AcpAccessResponseDto' },
          },
        },
      }),
    );
    expect(document.paths['/auth/acp/verify']).toBeUndefined();
    const bearerSecurity = [{ bearer: [] }];
    for (const path of [
      '/admin/permission-groups',
      '/admin/audit-logs',
      '/admin/accounts/{accountId}/sessions',
      '/settings/admin',
      '/articles/admin',
    ]) {
      expect(document.paths[path].get.security).toEqual(bearerSecurity);
    }
    expect(document.paths['/account/acp-access'].get.security).toEqual([
      { bearer: [] },
    ]);
    expect(document.paths['/settings/public'].get.security).toBeUndefined();
    expect(document.paths['/admin/permission-groups'].get).toBeDefined();
    expect(
      document.paths['/admin/permission-groups'].get.responses['200'],
    ).toEqual(
      expect.objectContaining({
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PermissionGroupsResponseDto',
            },
          },
        },
      }),
    );
    expect(
      document.paths['/admin/permission-groups/{groupId}/accounts'].get
        .responses['200'],
    ).toEqual(
      expect.objectContaining({
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PermissionGroupMembersResponseDto',
            },
          },
        },
      }),
    );
    expect(
      document.components?.schemas?.PermissionGroupMemberAccountDto,
    ).not.toHaveProperty('properties.password');
    expect(
      Object.keys(document.paths).filter((path) => path.startsWith('/turbo')),
    ).toEqual([]);
    expect(document.paths['/shop/purchase']).toBeUndefined();
    expect(document.paths['/account/sessions'].get).toEqual(
      expect.objectContaining({
        parameters: expect.arrayContaining([
          expect.objectContaining({
            name: 'page',
            in: 'query',
            schema: expect.objectContaining({ minimum: 1, maximum: 100_000 }),
          }),
          expect.objectContaining({
            name: 'limit',
            in: 'query',
            schema: expect.objectContaining({ minimum: 1, maximum: 100 }),
          }),
        ]),
      }),
    );
    SwaggerModule.setup('api/docs', app, document);
  });

  it('retains the custom i18n validation error envelope', async () => {
    const result = await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);
    expect(result.body).toHaveProperty('status');
    expect(result.body).toHaveProperty('code');
    expect(result.body.errors).toHaveLength(2);
    expect(result.headers['x-request-id']).toBeTruthy();
  });

  it('retains protected account routes', () => {
    return request(app.getHttpServer()).get('/account').expect(401);
  });

  it('protects staff permission-group routes', async () => {
    await request(app.getHttpServer())
      .get('/admin/permission-groups')
      .expect(401);
    await request(app.getHttpServer())
      .get('/admin/permission-groups/1/accounts')
      .expect(401);
  });

  describe('local ACP permissions', () => {
    let accessToken: string;
    let has: jest.SpiedFunction<PermissionService['has']>;
    let audit: jest.SpiedFunction<AuditLogService['record']>;

    beforeEach(async () => {
      activeSession.mockReset().mockResolvedValue({ accountId: 42 });
      accessToken = await app
        .get(TokenService)
        .execute(42, '8e6c2d81-2936-44c2-90ad-c2479cb72126');
      has = jest
        .spyOn(app.get(PermissionService), 'has')
        .mockResolvedValue(true);
      audit = jest
        .spyOn(app.get(AuditLogService), 'record')
        .mockResolvedValue(undefined);
    });

    afterEach(() => jest.restoreAllMocks());

    it('requires website login for ACP eligibility and no longer exposes Turbo verification', async () => {
      await request(app.getHttpServer()).get('/account/acp-access').expect(401);
      await request(app.getHttpServer()).post('/auth/acp/verify').expect(404);
    });

    it.each([true, false])(
      'returns effective account eligibility %s from local permissions',
      async (allowed) => {
        has.mockResolvedValue(allowed);
        const response = await request(app.getHttpServer())
          .get('/account/acp-access')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
        expect(response.body).toEqual({
          status: 'ok',
          code: 200,
          data: { canAccessAcp: allowed },
        });
        expect(has).toHaveBeenCalledWith(42, 'cms.acp.access');
      },
    );

    it('allows a permissioned admin operation with the website token and local permission only', async () => {
      const list = jest
        .spyOn(app.get(WebsiteSettingsService), 'listManageable')
        .mockResolvedValue([]);
      await request(app.getHttpServer())
        .get('/settings/admin')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(has).toHaveBeenCalledWith(42, 'cms.settings.manage');
      expect(has).toHaveBeenCalledWith(42, 'cms.acp.access');
      expect(list).toHaveBeenCalledTimes(1);
    });

    it('denies an admin operation when local ACP access is missing', async () => {
      has.mockImplementation(
        async (_account, node) => node !== 'cms.acp.access',
      );
      await request(app.getHttpServer())
        .get('/settings/admin')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
      expect(has).toHaveBeenCalledWith(42, 'cms.acp.access');
      expect(audit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'authorization.acp.denied',
          result: 'failure',
        }),
      );
    });

    it('denies an admin operation when its operation permission is missing', async () => {
      has.mockImplementation(
        async (_account, node) => node !== 'cms.settings.manage',
      );
      await request(app.getHttpServer())
        .get('/settings/admin')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe('signed-in account avatar contract', () => {
    let accessToken: string;
    let query: jest.SpyInstance;
    let grantedNodes: jest.SpiedFunction<PermissionService['grantedNodes']>;
    const player = {
      id: 501,
      name: 'fixture_abcdef',
      figure: 'hr-115-42',
      motto: '',
      status: 0,
      created_at: '2026-10-14T05:00:00.000000',
      updated_at: '2026-10-14T05:00:00.000000',
      last_login: null,
    };
    const balance = {
      player_id: 501,
      currency_type_id: 17,
      type: 1,
      activity_point_type: null,
      amount: 25,
    };

    beforeEach(async () => {
      findById.mockReset().mockResolvedValue({
        id: 42,
        email: 'fixture@example.com',
        emailVerified: true,
        created_at: new Date('2026-10-14T05:00:00Z'),
        password: 'must-not-escape',
        ip_current: '127.0.0.1',
      });
      activeSession.mockReset().mockResolvedValue({ accountId: 42 });
      accessToken = await app
        .get(TokenService)
        .execute(42, '8e6c2d81-2936-44c2-90ad-c2479cb72126');
      grantedNodes = jest
        .spyOn(app.get(PermissionService), 'grantedNodes')
        .mockResolvedValue(['cms.articles.manage']);
      query = jest
        .spyOn(app.get(DataSource), 'query')
        .mockResolvedValueOnce([player])
        .mockResolvedValueOnce([balance]);
    });

    afterEach(() => {
      query.mockRestore();
      grantedNodes.mockRestore();
    });

    it.each(['/account', '/auth/me'])(
      'returns the full safe avatar envelope from %s',
      async (path) => {
        const response = await request(app.getHttpServer())
          .get(path)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
        expect(response.body).toEqual({
          status: 'ok',
          code: 200,
          data: {
            id: 42,
            email: 'fixture@example.com',
            emailVerified: true,
            createdAt: '2026-10-14T05:00:00.000Z',
            ...(path === '/auth/me'
              ? { permissions: ['cms.articles.manage'] }
              : {}),
            avatars: [
              expect.objectContaining({
                id: 501,
                username: player.name,
                look: player.figure,
                credits: 25,
                lastLogin: Date.parse('2026-10-14T05:00:00Z') / 1000,
                gameLastLoginAt: null,
              }),
            ],
            activeAvatar: expect.any(Object),
          },
        });
        expect(response.body.data.activeAvatar).toEqual(
          response.body.data.avatars[0],
        );
        expect(findById).toHaveBeenCalledWith(42);
        expect(activeSession).toHaveBeenCalledWith(
          '8e6c2d81-2936-44c2-90ad-c2479cb72126',
          42,
        );
        expect(query).toHaveBeenCalledTimes(2);
        if (path === '/auth/me') {
          expect(grantedNodes).toHaveBeenCalledWith(42);
        } else {
          expect(grantedNodes).not.toHaveBeenCalled();
        }
      },
    );

    it.each(['/account', '/auth/me'])(
      'returns explicit empty/null avatar fields from %s',
      async (path) => {
        query.mockReset().mockResolvedValueOnce([]);
        const response = await request(app.getHttpServer())
          .get(path)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
        expect(response.body.data.avatars).toEqual([]);
        expect(response.body.data.activeAvatar).toBeNull();
      },
    );

    it('uses the earliest link for activeAvatar with multiple avatars', async () => {
      query
        .mockReset()
        .mockResolvedValueOnce([player, { ...player, id: 502 }])
        .mockResolvedValueOnce([balance, { ...balance, player_id: 502 }]);
      const response = await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(
        response.body.data.avatars.map((avatar: { id: number }) => avatar.id),
      ).toEqual([501, 502]);
      expect(response.body.data.activeAvatar.id).toBe(501);
      expect(query.mock.calls[0][0]).toContain(
        'ORDER BY l.created_at ASC, l.id ASC',
      );
    });

    it.each(['/account', '/auth/me'])(
      'does not hide a dangling link on %s',
      async (path) => {
        query.mockReset().mockResolvedValueOnce([{ ...player, id: null }]);
        const response = await request(app.getHttpServer())
          .get(path)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(500);
        expect(response.body.data).toBeUndefined();
      },
    );

    it('returns unauthorized for a missing account without reading game data', async () => {
      findById.mockResolvedValueOnce(null);
      await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      expect(query).not.toHaveBeenCalled();
    });

    it.each(['/account', '/auth/me'])(
      'does not return an empty avatar on a database failure: %s',
      async (path) => {
        query
          .mockReset()
          .mockRejectedValueOnce(new Error('test database unavailable'));
        const response = await request(app.getHttpServer())
          .get(path)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(500);
        expect(response.body.data).toBeUndefined();
      },
    );

    it('rejects an inactive website session without reading account or game data', async () => {
      activeSession.mockResolvedValueOnce(null);
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      expect(findById).not.toHaveBeenCalled();
      expect(query).not.toHaveBeenCalled();
    });
  });

  it.each(['page=0', 'limit=0'])(
    'rejects nonpositive pagination without querying MySQL: %s',
    (query) =>
      request(app.getHttpServer())
        .get(`/articles/available?${query}`)
        .expect(400),
  );

  it('does not invent a root route', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  it('exports every mapped table and foreign key, including the join table', () => {
    const source = app.get(DataSource);
    const sql = readFileSync(
      join(__dirname, '..', 'docs', 'schema.sql'),
      'utf8',
    );
    expect(source.entityMetadatas).toHaveLength(11);
    expect(
      source.entityMetadatas.every((metadata) =>
        metadata.tableName.startsWith('xdr_'),
      ),
    ).toBe(true);
    expect(sql.match(/CREATE TABLE /g)).toHaveLength(
      source.entityMetadatas.length,
    );
    for (const metadata of source.entityMetadatas) {
      const statementStart = sql.indexOf(
        `CREATE TABLE \`${metadata.tableName}\``,
      );
      expect(statementStart).toBeGreaterThanOrEqual(0);
      const statement = sql.slice(
        statementStart,
        sql.indexOf(';', statementStart),
      );
      for (const column of metadata.columns) {
        expect(statement).toContain(`\`${column.databaseName}\``);
      }
      for (const foreignKey of metadata.foreignKeys) {
        expect(sql).toContain(`ADD CONSTRAINT \`${foreignKey.name}\``);
      }
    }
  });

  it('keeps migration DDL and migration history scoped to XDR tables', () => {
    const migration = readFileSync(
      join(
        __dirname,
        '..',
        'src',
        'providers',
        'database',
        'migrations',
        '1770000000000-XdrApiFoundation.ts',
      ),
      'utf8',
    );
    const datasource = readFileSync(
      join(
        __dirname,
        '..',
        'src',
        'providers',
        'database',
        'xdr-data-source.ts',
      ),
      'utf8',
    );
    const createdTables = Array.from(
      migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z0-9_]+)/gi),
      (match) => match[1],
    );

    expect(createdTables.length).toBeGreaterThan(0);
    expect(createdTables.every((table) => table.startsWith('xdr_'))).toBe(true);
    expect(datasource).toContain('entities: XdrEntities');
    expect(datasource).toContain("migrationsTableName: 'xdr_migrations'");
    expect(datasource).toContain('synchronize: false');
  });
});
