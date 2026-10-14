import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";

function isTokenDuration(value: unknown): value is StringValue {
    return typeof value === 'string' &&
        /^-?(?:\d+|\d*\.\d+) ?(?:years?|yrs?|y|weeks?|w|days?|d|hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s|milliseconds?|msecs?|ms)?$/i.test(value);
}

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

    public get duration() : StringValue {
        const duration = this.configService.get<string>('token.duration');
        if (!isTokenDuration(duration)) {
            throw new Error('TOKEN_DURATION must be a valid JWT time span');
        }
        return duration;
    }

    public get secret() : string {
        return this.configService.get<string>('token.secret');
    }
}