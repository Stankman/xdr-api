import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Avatar } from "./entities/avatar.entity";
import { AppConfigModule } from "src/config/app/app-config.module";
import { AvatarsController } from "./controllers/avatars.controller";
import { AvatarService } from './services/avatar.service';
import { AvatarsRepository } from "./repositories/avatars.repository";
import { AvatarSettings } from "./entities/avatar-settings.entity";
import { AvatarsSettingsRepository } from "./repositories/avatars-settings.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([Avatar, AvatarSettings]),
        AppConfigModule
    ],
    controllers: [
        AvatarsController
    ],
    providers: [
        AvatarService,
        AvatarsRepository,
        AvatarsSettingsRepository
    ],
    exports: [
        AvatarService,
        AvatarsRepository,
        AvatarsSettingsRepository
    ]
})
export class AvatarModule {}