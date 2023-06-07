import { Module } from "@nestjs/common";
import { RconConfigModule } from "src/config/rcon/rcon-config.module";
import { RconController } from "./controllers/rcon.controller";
import { RconService } from "./services/rcon.service";
import { SocketService } from "./services/socket.service";

@Module({
    imports: [
        RconConfigModule
    ],
    controllers: [RconController],
    providers: [
        RconService,
        SocketService
    ],
    exports: [
        RconService,
        SocketService
    ]
})
export class RconModule {}