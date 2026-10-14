import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AppConfigModule } from './config/app/app-config.module';
import { MySQLConfigModule } from './config/mysql/mysql-config.module';
import { TokenConfigModule } from './config/token/token-config.module';
import { MySQLProviderModule } from './providers/database/mysql/mysql-provider.module';
import { AccountModule } from './modules/account/account.module';
import { ArticleModule } from './modules/article/article.module';
import { AuthenticationModule } from './modules/auth/authentication.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { SettingModule } from './modules/setting/setting.module';
import { TurboModule } from './modules/turbo/turbo.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/exceptions/exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

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
    TokenConfigModule,
    MySQLProviderModule,
    AccountModule,
    ArticleModule,
    AuthenticationModule,
    AuditModule,
    AdminModule,
    SettingModule,
    TurboModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
