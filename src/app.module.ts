import { AppConfigModule } from './config/app/app-config.module';
import { MySQLConfigModule } from './config/mysql/mysql-config.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AppConfigModule,
    MySQLConfigModule
  ]
})
export class AppModule {}
