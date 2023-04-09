import { Module } from '@nestjs/common';
import {
  I18nModule,
  QueryResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n-2';
import * as path from 'path';

import { AppConfigModule } from './config/app/app-config.module';
import { MySQLConfigModule } from './config/mysql/mysql-config.module';
import { MySQLProviderModule } from './providers/database/mysql/mysql-provider.module';

import { AuthenticationModule } from './modules/auth/authentication.module';
import { BanModule } from './modules/ban/ban.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [QueryResolver, AcceptLanguageResolver],
    }),

    AppConfigModule,
    MySQLConfigModule,

    MySQLProviderModule,

    AuthenticationModule,
    BanModule,
    UserModule
  ],
})
export class AppModule {}
