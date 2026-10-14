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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MySQLProviderModule)
      .useModule(TestDatabaseModule)
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

  it('documents only the active XDR and Turbo integration routes', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    expect(document.paths['/articles/available'].get).toBeDefined();
    expect(document.paths['/auth/login'].post).toBeDefined();
    expect(document.paths['/settings/public'].get).toBeDefined();
    expect(document.paths['/turbo/players'].get).toBeDefined();
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
    expect(source.entityMetadatas).toHaveLength(7);
    expect(source.entityMetadatas.every((metadata) => metadata.tableName.startsWith('xdr_'))).toBe(
      true,
    );
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
      join(__dirname, '..', 'src', 'providers', 'database', 'xdr-data-source.ts'),
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
