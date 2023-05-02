import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { AccountController } from './controllers/account.controller';
import { AccountsController } from './controllers/accounts.controller';
import { AccountsRepository } from './repositories/accounts.repository';
import { Account } from './entities/account.entity';
import { AccountsService } from './services/accounts.service';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { JwtService } from '@nestjs/jwt';
import { AccountSettingsService } from './services/account-settings.service';
import { HashService } from '../auth/services/hash.service';
import { Argon2ConfigModule } from 'src/config/argon2/argon2-config.module';
import { AccountsRoles } from './entities/accounts-roles.entity';
import { AccountsRolesService } from './services/accounts-roles.service';
import { RolesService } from '../role/services/roles.service';
import { AccountsRolesRepository } from './repositories/accounts-roles.repository';
import { RolesRepository } from '../role/repositories/roles.repository';
import { RolePermissionsService } from '../role/services/role-permissions.service';
import { RolePermissionsRepository } from '../role/repositories/role-permissions.repository';
import { RolesPermissionsRepository } from '../role/repositories/roles-permissions.repository';
import { RolesPermissionsService } from '../role/services/roles-permissions.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Account, AccountsRoles]),
        TokenConfigModule,
        AppConfigModule,
        Argon2ConfigModule
    ],
    controllers: [
        AccountsController,
        AccountController
    ],
    providers: [
        AccountsRepository,
        AccountsRolesRepository,
        RolesRepository,
        RolePermissionsRepository,
        RolesPermissionsRepository,

        AccountsService,
        AccountSettingsService,
        AccountsRolesService,
        RolesService,
        RolePermissionsService,
        RolesPermissionsService,
        HashService,
        JwtService
    ],
    exports: [
        AccountsService,
        AccountSettingsService,
        AccountsRolesService
    ]
})
export class AccountModule {}
