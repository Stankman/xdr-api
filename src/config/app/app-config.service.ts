import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()

/**
 * Service dealing with app config based operations.
 *
 * @class AppConfigService
 */
export class AppConfigService {

    constructor(private configService : ConfigService) {}

    public get env() : string {
        return this.configService.get<string>('app.env');
    }

    public get name() : string {
        return this.configService.get<string>('app.name');
    }

    public get url() : string {
        return this.configService.get<string>('app.url');
    }

    public get port() : number {
        return this.configService.get<number>('app.port');
    }
}