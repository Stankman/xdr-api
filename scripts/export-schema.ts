import 'reflect-metadata';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DataSource, Table, TableForeignKey } from 'typeorm';
import { XdrEntities } from '../src/providers/database/xdr-entities';

class SchemaDataSource extends DataSource {
  public async loadMetadata(): Promise<void> {
    await this.buildMetadatas();
  }
}

async function exportSchema(): Promise<void> {
  const source = new SchemaDataSource({
    type: 'mysql',
    database: 'xdr_model',
    entities: XdrEntities,
  });
  await source.loadMetadata();
  const runner = source.createQueryRunner();
  runner.enableSqlMemory();
  const metadata = [...source.entityMetadatas].sort((a, b) =>
    a.tableName.localeCompare(b.tableName),
  );

  for (const entity of metadata) {
    await runner.createTable(Table.create(entity, source.driver), false, false);
  }
  // Add constraints after all tables exist, including the account/avatar cycle.
  for (const entity of metadata) {
    const table = Table.create(entity, source.driver);
    for (const foreignKey of entity.foreignKeys) {
      await runner.createForeignKey(
        table,
        TableForeignKey.create(foreignKey, source.driver),
      );
    }
  }

  const statements = runner.getMemorySql().upQueries.map(({ query }) => {
    if (query.startsWith('CREATE TABLE')) {
      query = query
        .replace(' (', ' (\n  ')
        .replace(
          /, (?=`\w+` [a-z]|UNIQUE INDEX|INDEX|PRIMARY KEY|CONSTRAINT)/g,
          ',\n  ',
        )
        .replace(/\) ENGINE/, '\n) ENGINE');
    }
    return query + ';';
  });
  const header = [
    '-- Generated from TypeORM entity metadata by npm run schema:export.',
    '-- XDR-owned tables only. This is a reference model, not a production migration.',
    '-- Apply production changes only with the xdr-scoped TypeORM migrations.',
    '-- No database connection is opened by the exporter.',
  ].join('\n');
  const output = `${header}\n\n${statements.join('\n\n')}\n`;
  const directory = join(__dirname, '..', 'docs');
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'schema.sql'), output);
  console.log(`Exported ${metadata.length} XDR tables to docs\\schema.sql`);
}

exportSchema().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
