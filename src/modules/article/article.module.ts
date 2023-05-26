import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { AccountsRepository } from '../account/repositories/accounts.repository';
import { AccountService } from '../account/services/accounts.service';
import { RolePermissionsRepository } from '../role/repositories/role-permissions.repository';
import { RolesPermissionsRepository } from '../role/repositories/roles-permissions.repository';
import { RolesRepository } from '../role/repositories/roles.repository';
import { RolePermissionsService } from '../role/services/role-permissions.service';
import { RolesPermissionsService } from '../role/services/roles-permissions.service';
import { RolesService } from '../role/services/roles.service';
import { ArticlesController } from './controllers/articles.controller';
import { ArticlesRepository } from './repositories/articles.repository';
import { ArticlesService } from './services/articles.service';
import { AccountModule } from '../account/account.module';
import { RolesModule } from '../role/roles.module';
import { HashService } from '../shared/services/hash.service';
import { Argon2ConfigService } from 'src/config/argon2/argon2-config.service';
import { Argon2ConfigModule } from 'src/config/argon2/argon2-config.module';

@Module({
  imports: [
    TokenConfigModule,
    AppConfigModule,
    Argon2ConfigModule,
    AccountModule,
    RolesModule
  ],
  controllers: [
    ArticlesController
  ],
  providers: [
    ArticlesService,
    ArticlesRepository,
    JwtService,
    HashService
  ],
  exports: [
    ArticlesService,
    ArticlesRepository
  ]
})
export class ArticleModule {}
