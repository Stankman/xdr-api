import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { AccountsRepository } from '../account/repositories/accounts.repository';
import { AccountsService } from '../account/services/accounts.service';
import { RolePermissionsRepository } from '../role/repositories/role-permissions.repository';
import { RolesPermissionsRepository } from '../role/repositories/roles-permissions.repository';
import { RolesRepository } from '../role/repositories/roles.repository';
import { RolePermissionsService } from '../role/services/role-permissions.service';
import { RolesPermissionsService } from '../role/services/roles-permissions.service';
import { RolesService } from '../role/services/roles.service';
import { ArticlesController } from './controllers/articles.controller';
import { ArticlesRepository } from './repositories/articles.repository';
import { ArticlesService } from './services/articles.service';

@Module({
  imports: [
    TokenConfigModule,
    AppConfigModule,
  ],
  controllers: [
    ArticlesController
  ],
  providers: [
    AccountsService,
    ArticlesService,
    JwtService,
    RolesService,
    RolePermissionsService,
    RolesPermissionsService,

    AccountsRepository,
    ArticlesRepository,
    RolesRepository,
    RolePermissionsRepository,
    RolesPermissionsRepository
  ],
  exports: [
    ArticlesService,

    ArticlesRepository
  ]
})
export class ArticleModule {}
