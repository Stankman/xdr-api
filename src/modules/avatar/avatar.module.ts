import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Avatar } from "./entities/avatar.entity";
import { AppConfigModule } from "src/config/app/app-config.module";
import { AvatarsController } from "./controllers/avatars.controller";
import { AvatarService } from './services/avatar.service';
import { AvatarsRepository } from "./repositories/avatars.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([Avatar]),
        AppConfigModule
    ],
    controllers: [
        AvatarsController
    ],
    providers: [
        AvatarService,
        AvatarsRepository
    ],
    exports: [
        AvatarService,
        AvatarsRepository
    ]
})
export class AvatarModule {}