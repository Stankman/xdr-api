import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArcturusSetting } from './entities/arcturus-setting.entity';
import { XdrSetting } from './entities/xdr-setting.entity';
import { ArcturusSettingsRepository } from './repositories/arcturus-settings.repository';
import { XdrSettingsRepository } from './repositories/xdr-settings.repository';
import { ArcturusSettingService } from './services/arcturus-setting.service';
import { XdrSettingService } from './services/xdr-setting.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            XdrSetting,
            ArcturusSetting
        ])
    ],
    controllers: [

    ],
    providers: [
        XdrSettingsRepository,
        XdrSettingService,

        ArcturusSettingsRepository,
        ArcturusSettingService
    ],
    exports: [
        XdrSettingsRepository,
        XdrSettingService,

        ArcturusSettingsRepository,
        ArcturusSettingService
    ]
})
export class SettingModule {}
