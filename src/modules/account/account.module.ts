import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Argon2ConfigModule } from "src/config/argon2/argon2-config.module";
import { AvatarModule } from "../avatar/avatar.module";
import { HashService } from "../shared/services/hash.service";
import { SharedModule } from "../shared/shared.module";
import { AccountController } from "./controllers/account.controller";
import { AccountsController } from "./controllers/accounts.controller";
import { Account } from "./entities/account.entity";
import { AccountsRepository } from "./repositories/accounts.repository";
import { AccountSettingsService } from "./services/account-settings.service";
import { AccountService } from "./services/accounts.service";
import { RoleModule } from "../role/role.module";

@Module({
    imports: [
        Argon2ConfigModule,
        AvatarModule,
        RoleModule,
        SharedModule,
        TypeOrmModule.forFeature([Account])
    ],
    controllers: [
        AccountController,
        AccountsController
    ],
    providers: [
        AccountsRepository,
        AccountService,
        AccountSettingsService,
        HashService
    ],
    exports: [
        AccountService,
        AccountSettingsService,
    ]
})
export class AccountModule {}
