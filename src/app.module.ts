import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AppConfigModule } from './config/app/app-config.module';
import { MySQLConfigModule } from './config/mysql/mysql-config.module';
import { MySQLProviderModule } from './providers/database/mysql/mysql.provider';

import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AppConfigModule, 
    MySQLConfigModule,

    MySQLProviderModule,

    UserModule
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
