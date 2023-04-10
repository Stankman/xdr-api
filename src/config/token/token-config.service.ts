import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()

/**
 * Service dealing with JWT Token config based operations.
 *
 * @class TokenConfigService
 */
export class TokenConfigService {

    constructor(private configService : ConfigService) {}

    public get issuer() : string {
        return this.configService.get<string>('token.issuer');
    }

    public get duration() : string {
        return this.configService.get<string>('token.duration');
    }

    public get secret() : string {
        return this.configService.get<string>('token.secret');
    }
}