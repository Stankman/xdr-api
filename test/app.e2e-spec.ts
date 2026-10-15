import { Test, TestingModule } from '@nestjs/testing';
import {
  Global,
  INestApplication,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
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
import { Article } from '../src/modules/article/entities/article.entity';

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
    expect(document.paths['/articles'].get).toBeDefined();
    expect(document.paths['/articles/slug/{slug}'].get).toBeDefined();
    expect(document.paths['/articles/{id}'].get).toBeDefined();
    expect(document.paths['/admin/articles'].get).toBeDefined();
    expect(document.paths['/admin/articles/{id}'].get).toBeDefined();
    expect(document.paths['/articles/available']).toBeUndefined();
    expect(document.paths['/articles/admin']).toBeUndefined();
    expect(document.paths['/articles'].post).toBeUndefined();
    expect(document.paths['/articles/{id}'].put).toBeUndefined();
    expect(document.paths['/articles/{id}'].delete).toBeUndefined();
    expect(document.paths['/articles/{id}/publish']).toBeUndefined();
    for (const [path, method] of [
      ['/admin/articles', 'get'],
      ['/admin/articles', 'post'],
      ['/admin/articles/{id}', 'get'],
      ['/admin/articles/{id}', 'put'],
      ['/admin/articles/{id}', 'delete'],
      ['/admin/articles/{id}/publish', 'post'],
    ]) {
      expect(document.paths[path][method].security).toEqual([{ bearer: [] }]);
    }
    for (const path of [
      '/articles',
      '/articles/slug/{slug}',
      '/articles/{id}',
    ]) {
      expect(document.paths[path].get.security).toBeUndefined();
    }
    expect(document.paths['/auth/login'].post).toBeDefined();
    expect(document.paths['/account'].get.responses['200']).toEqual(
      expect.objectContaining({
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AccountSummaryResponseDto',
            },
          },
        },
      }),
    );
    expect(document.paths['/auth/me']).toBeUndefined();
    expect(document.paths['/account'].get.security).toEqual([{ bearer: [] }]);
    expect(document.components?.schemas?.AccountSummaryResponseDto).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          data: { $ref: '#/components/schemas/CurrentAccountDto' },
        }),
      }),
    );
    expect(document.components?.schemas?.CurrentAccountDto).toEqual(
      expect.objectContaining({
        required: expect.arrayContaining(['permissions']),
        properties: expect.objectContaining({
          permissions: expect.objectContaining({
            type: 'array',
            items: { type: 'string' },
          }),
        }),
      }),
    );
    expect(document.paths['/account'].put).toBeUndefined();
    expect(document.paths['/account/settings/change-password']).toBeUndefined();
    expect(document.paths['/account/settings/change-email']).toBeUndefined();
    expect(document.paths['/accounts/all']).toBeUndefined();
    expect(document.paths['/accounts/{id}']).toBeUndefined();
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
      '/admin/articles',
      '/admin/articles/{id}',
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

    describe('administrative articles', () => {
      const draft = {
        id: 9,
        title: 'Draft',
        slug: 'draft',
        hidden: true,
        publishedAt: null,
      };

      it.each(['/admin/articles', '/admin/articles/9'])(
        'requires a website login: %s',
        (path) => request(app.getHttpServer()).get(path).expect(401),
      );

      it.each([
        ['post', '/admin/articles'],
        ['put', '/admin/articles/9'],
        ['delete', '/admin/articles/9'],
        ['post', '/admin/articles/9/publish'],
      ] as const)('requires a website login for %s %s', (method, path) =>
        request(app.getHttpServer())[method](path).expect(401),
      );

      it.each([
        ['post', '/admin/articles'],
        ['put', '/admin/articles/9'],
        ['delete', '/admin/articles/9'],
        ['post', '/admin/articles/9/publish'],
      ] as const)(
        'denies %s %s without cms.articles.manage',
        async (method, path) => {
          has.mockImplementation(
            async (_account, node) => node !== 'cms.articles.manage',
          );
          await request(app.getHttpServer())
            [method](path)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ title: 'T', description: 'D', content: 'C' })
            .expect(403);
        },
      );

      it.each([
        ['post', '/articles'],
        ['put', '/articles/9'],
        ['delete', '/articles/9'],
        ['post', '/articles/9/publish'],
      ] as const)(
        'no longer exposes legacy write route %s %s',
        (method, path) =>
          request(app.getHttpServer())[method](path).expect(404),
      );

      it.each([
        ['/admin/articles', 'cms.articles.manage'],
        ['/admin/articles/9', 'cms.articles.manage'],
        ['/admin/articles', 'cms.acp.access'],
        ['/admin/articles/9', 'cms.acp.access'],
      ])('denies %s without %s', async (path, missing) => {
        has.mockImplementation(async (_account, node) => node !== missing);
        await request(app.getHttpServer())
          .get(path)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(403);
      });

      it('lists unavailable articles for an authorized administrator', async () => {
        const repository = app.get<Repository<Article>>(
          getRepositoryToken(Article),
        );
        const query = {
          andWhere: jest.fn().mockReturnThis(),
          clone: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(1),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([draft]),
        };
        jest
          .spyOn(repository, 'createQueryBuilder')
          .mockReturnValue(query as never);
        const response = await request(app.getHttpServer())
          .get('/admin/articles')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
        expect(response.body.data.items).toEqual([
          expect.objectContaining({ id: 9, hidden: true }),
        ]);
        expect(response.body.data.meta.totalItems).toBe(1);
        expect(query.andWhere).not.toHaveBeenCalled();
        expect(has).toHaveBeenCalledWith(42, 'cms.articles.manage');
      });

      it('returns an unavailable article by ID to an authorized administrator', async () => {
        const repository = app.get<Repository<Article>>(
          getRepositoryToken(Article),
        );
        const findOne = jest
          .spyOn(repository, 'findOne')
          .mockResolvedValue(draft as unknown as Article);
        const response = await request(app.getHttpServer())
          .get('/admin/articles/9')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);
        expect(response.body.data).toEqual(
          expect.objectContaining({ id: 9, hidden: true, publishedAt: null }),
        );
        expect(findOne).toHaveBeenCalledWith({ where: { id: 9 } });
      });
    });
  });

  describe('public articles', () => {
    afterEach(() => jest.restoreAllMocks());

    it('lists only available articles', async () => {
      const repository = app.get<Repository<Article>>(
        getRepositoryToken(Article),
      );
      const query = {
        andWhere: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(query as never);
      await request(app.getHttpServer()).get('/articles').expect(200);
      expect(query.andWhere).toHaveBeenCalledWith('article.hidden = :hidden', {
        hidden: false,
      });
      expect(query.andWhere).toHaveBeenCalledWith(
        'article.publishedAt IS NOT NULL',
      );
    });

    it.each(['/articles/9', '/articles/slug/draft'])(
      'does not reveal an unavailable article: %s',
      async (path) => {
        const repository = app.get<Repository<Article>>(
          getRepositoryToken(Article),
        );
        const findOne = jest
          .spyOn(repository, 'findOne')
          .mockResolvedValue(null);
        await request(app.getHttpServer()).get(path).expect(404);
        expect(findOne).toHaveBeenCalledWith({
          where: expect.objectContaining({
            hidden: false,
            publishedAt: expect.anything(),
          }),
        });
      },
    );
  });

  describe('signed-in account contract', () => {
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

    it('returns the full safe account envelope with effective permissions', async () => {
      const response = await request(app.getHttpServer())
        .get('/account')
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
          permissions: ['cms.articles.manage'],
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
      expect(grantedNodes).toHaveBeenCalledTimes(1);
      expect(grantedNodes).toHaveBeenCalledWith(42);
    });

    it('returns explicit empty/null avatar fields', async () => {
      query.mockReset().mockResolvedValueOnce([]);
      const response = await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.data.avatars).toEqual([]);
      expect(response.body.data.activeAvatar).toBeNull();
    });

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

    it('does not hide a dangling link', async () => {
      query.mockReset().mockResolvedValueOnce([{ ...player, id: null }]);
      const response = await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(500);
      expect(response.body.data).toBeUndefined();
    });

    it('returns unauthorized for a missing account without reading game data', async () => {
      findById.mockResolvedValueOnce(null);
      await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      expect(query).not.toHaveBeenCalled();
    });

    it('does not return an empty avatar on a database failure', async () => {
      query
        .mockReset()
        .mockRejectedValueOnce(new Error('test database unavailable'));
      const response = await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(500);
      expect(response.body.data).toBeUndefined();
    });

    it('rejects an inactive website session without reading account or game data', async () => {
      activeSession.mockResolvedValueOnce(null);
      await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      expect(findById).not.toHaveBeenCalled();
      expect(query).not.toHaveBeenCalled();
      expect(grantedNodes).not.toHaveBeenCalled();
    });

    it('rejects an unauthenticated request before reading account or permissions', async () => {
      await request(app.getHttpServer()).get('/account').expect(401);

      expect(activeSession).not.toHaveBeenCalled();
      expect(findById).not.toHaveBeenCalled();
      expect(query).not.toHaveBeenCalled();
      expect(grantedNodes).not.toHaveBeenCalled();
    });

    it('returns an empty permissions array when no permissions are granted', async () => {
      grantedNodes.mockResolvedValueOnce([]);
      const response = await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.permissions).toEqual([]);
      expect(grantedNodes).toHaveBeenCalledWith(42);
    });

    it('does not hide a permission lookup failure behind an empty permissions array', async () => {
      grantedNodes.mockRejectedValueOnce(new Error('permission lookup failed'));
      const response = await request(app.getHttpServer())
        .get('/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(500);

      expect(response.body.data).toBeUndefined();
      expect(grantedNodes).toHaveBeenCalledWith(42);
    });

    it('does not expose the removed /auth/me route', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(404);
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(findById).not.toHaveBeenCalled();
      expect(query).not.toHaveBeenCalled();
      expect(grantedNodes).not.toHaveBeenCalled();
    });
  });

  it.each(['page=0', 'limit=0'])(
    'rejects nonpositive pagination without querying MySQL: %s',
    (query) =>
      request(app.getHttpServer()).get(`/articles?${query}`).expect(400),
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
