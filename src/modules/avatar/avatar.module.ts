import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Avatar } from "./entities/avatar.entity";
import { AppConfigModule } from "src/config/app/app-config.module";
import { AvatarsController } from "./controllers/avatars.controller";
import { AvatarService } from './services/avatar.service';
import { AvatarsRepository } from "./repositories/avatars.repository";
import { AvatarSettings } from "./entities/avatar-settings.entity";
import { AvatarsSettingsRepository } from "./repositories/avatars-settings.repository";
import { AvatarSettingsService } from "./services/avatar-settings.service";
import { AvatarCurrency } from "./entities/avatar-currency.entity";
import { AvatarCurrencyService } from "./services/avatar-currency.service";
import { AvatarsCurrencyRepository } from "./repositories/avatars-currency.repository";
import { SettingModule } from "../setting/setting.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Avatar, AvatarSettings, AvatarCurrency]),
        AppConfigModule,
        SettingModule
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