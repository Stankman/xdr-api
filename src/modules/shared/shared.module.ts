import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AppConfigModule } from "src/config/app/app-config.module";
import { TokenConfigModule } from "src/config/token/token-config.module";
import { AccountsRepository } from "../account/repositories/accounts.repository";
import { AccountGuardService } from "../account/services/account-guard.service";
import { PermissionsRepository } from "../role/repositories/permissions.repository";
import { PermissionGuardService } from "../role/services/permission-guard.service";

@Module({
    imports: [
        AppConfigModule, 
        JwtModule,
        TokenConfigModule
    ],
    providers: [
        AccountGuardService,
        AccountsRepository,
        PermissionGuardService,
        PermissionsRepository
    ],
    exports: [
        AppConfigModule, 
        JwtModule,
        TokenConfigModule,
        AccountGuardService,
        AccountsRepository,
        PermissionGuardService,
        PermissionsRepository
    ],
})
export class SharedModule {}
