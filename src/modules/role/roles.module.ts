import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { AccountsRepository } from '../account/accounts.repository';
import { AccountsService } from '../account/services/accounts.service';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from './entities/role.entity';
import { RolesPermissions } from './entities/roles-permissions.entity';
import { RolePermissionsController } from './role-permissions.controller';
import { RolePermissionsRepository } from './role-permissions.repository';
import { RolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';
import { RolePermissionsService } from './services/role-permissions.service';
import { RolesService } from './services/roles.service';
import { RolesPermissionsService } from './services/roles-permissions.service';
import { RolesPermissionsRepository } from './roles-permissions.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, RolePermission, RolesPermissions]),
        TokenConfigModule,
        AppConfigModule
    ],
    controllers: [
        RolesController,
        RolePermissionsController
    ],
    providers: [
        RolesRepository,
        RolesService,
        RolePermissionsRepository,
        RolePermissionsService,
        RolesPermissionsRepository,
        RolesPermissionsService,
        AccountsRepository,
        AccountsService,
        JwtService
    ],
    exports: [
        RolesService,
        RolePermissionsService,
        RolesPermissionsService
    ]
})
export class RolesModule {}
