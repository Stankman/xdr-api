import { Module } from "@nestjs/common";
import { I18nModule, QueryResolver, AcceptLanguageResolver } from "nestjs-i18n-2";
import * as path from "path";

import { AppConfigModule } from "./config/app/app-config.module";
import { MySQLConfigModule } from "./config/mysql/mysql-config.module";
import { MySQLProviderModule } from "./providers/database/mysql/mysql.provider";

import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [QueryResolver, AcceptLanguageResolver],
    }),

    AppConfigModule,
    MySQLConfigModule,

    MySQLProviderModule,

    UserModule
  ]
})
export class AppModule {}