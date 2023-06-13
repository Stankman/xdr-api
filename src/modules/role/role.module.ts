import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountModule } from "../account/account.module";
import { SharedModule } from "../shared/shared.module";
import { PermissionsController } from "./controllers/permissions.controller";
import { RolesController } from "./controllers/roles.controller";
import { Permission } from "./entities/permission.entity";
import { Role } from "./entities/role.entity";
import { PermissionsRepository } from "./repositories/permissions.repository";
import { RolesRepository } from "./repositories/roles.repository";
import { PermissionService } from "./services/permission.service";
import { RoleService } from "./services/role.service";

@Module({
    imports: [
        forwardRef(() => AccountModule),
        SharedModule,
        TypeOrmModule.forFeature([Role, Permission])
    ],
    controllers: [
        PermissionsController,
        RolesController
    ],
    providers: [
        PermissionsRepository,
        PermissionService,
        RolesRepository,
        RoleService
    ],
    exports: [
        PermissionsRepository,
        PermissionService,
        RolesRepository,
        RoleService
    ]
})
export class RoleModule {}
