import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArcturusSettingsController } from "./controllers/arcturus-settings.controller";
import { ArcturusTextsController } from "./controllers/arcturus-texts.controller";
import { XdrSettingsController } from "./controllers/xdr-settings.controller";
import { ArcturusSetting } from "./entities/arcturus-setting.entity";
import { ArcturusText } from "./entities/arcturus-text.entity";
import { XdrSetting } from "./entities/xdr-setting.entity";
import { ArcturusSettingsRepository } from "./repositories/arcturus-settings.repository";
import { ArcturusTextsRepository } from "./repositories/arcturus-texts.repository";
import { XdrSettingsRepository } from "./repositories/xdr-settings.repository";
import { ArcturusSettingService } from "./services/arcturus-setting.service";
import { ArcturusTextService } from "./services/arcturus-text.service";
import { XdrSettingService } from "./services/xdr-setting.service";
import { SharedModule } from "../shared/shared.module";

@Module({
    imports: [
        SharedModule,
        TypeOrmModule.forFeature([ArcturusSetting, ArcturusText, XdrSetting])
    ],
    controllers: [
        XdrSettingsController,
        ArcturusSettingsController,
        ArcturusTextsController
    ],
    providers: [
        XdrSettingsRepository,
        XdrSettingService,
        ArcturusSettingsRepository,
        ArcturusSettingService,
        ArcturusTextsRepository,
        ArcturusTextService
    ],
    exports: [
        XdrSettingsRepository,
        XdrSettingService,
        ArcturusSettingsRepository,
        ArcturusSettingService,
        ArcturusTextsRepository,
        ArcturusTextService
    ]
})
export class SettingModule {}
