import { Module } from '@nestjs/common';
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';

import { AppConfigModule } from './config/app/app-config.module';
import { Argon2ConfigModule } from './config/argon2/argon2-config.module';
import { MySQLConfigModule } from './config/mysql/mysql-config.module';
import { TokenConfigModule } from './config/token/token-config.module';

import { MySQLProviderModule } from './providers/database/mysql/mysql-provider.module';

import { AuthenticationModule } from './modules/auth/authentication.module';
import { BanModule } from './modules/ban/ban.module';
import { AccountModule } from './modules/account/account.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/exceptions/exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

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
    Argon2ConfigModule,
    MySQLConfigModule,
    TokenConfigModule,

    MySQLProviderModule,

    AuthenticationModule,
    BanModule,
    AccountModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
