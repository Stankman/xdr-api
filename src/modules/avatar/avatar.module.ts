import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingModule } from "../setting/setting.module";
import { SharedModule } from "../shared/shared.module";
import { AvatarsController } from "./controllers/avatars.controller";
import { AvatarCurrency } from "./entities/avatar-currency.entity";
import { AvatarSettings } from "./entities/avatar-settings.entity";
import { Avatar } from "./entities/avatar.entity";
import { AvatarsCurrencyRepository } from "./repositories/avatars-currency.repository";
import { AvatarsSettingsRepository } from "./repositories/avatars-settings.repository";
import { AvatarsRepository } from "./repositories/avatars.repository";
import { AvatarCurrencyService } from "./services/avatar-currency.service";
import { AvatarSettingsService } from "./services/avatar-settings.service";
import { AvatarService } from "./services/avatar.service";
import { RoleModule } from "../role/role.module";

@Module({
    imports: [
        RoleModule,
        SettingModule,
        SharedModule,
        TypeOrmModule.forFeature([Avatar, AvatarSettings, AvatarCurrency]),
    ],
    controllers: [
        AvatarsController
    ],
    providers: [
        AvatarService,
        AvatarsRepository,
        AvatarSettingsService,
        AvatarsSettingsRepository,
        AvatarCurrencyService,
        AvatarsCurrencyRepository
    ],
    exports: [
        AvatarService,
        AvatarsRepository,
        AvatarSettingsService,
        AvatarsSettingsRepository,
        AvatarCurrencyService,
        AvatarsCurrencyRepository
    ]
})
export class AvatarModule {}