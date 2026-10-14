import 'dotenv/config';
import { DataSource } from 'typeorm';
import { XdrEntities } from './xdr-entities';
import { XdrApiFoundation1770000000000 } from './migrations/1770000000000-XdrApiFoundation';

export default new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  username: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'database',
  entities: XdrEntities,
  migrations: [XdrApiFoundation1770000000000],
  migrationsTableName: 'xdr_migrations',
  synchronize: false,
  migrationsRun: false,
  logging: false,
});
