import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()

/**
 * Service dealing with Rcon config based operations.
 *
 * @class RconConfigService
 */
export class RconConfigService {

    constructor(private configService : ConfigService) {}

    public get host() : string {
        return this.configService.get<string>('rcon.host');
    }

    public get port() : number {
        return this.configService.get<number>('rcon.port');
    }
}