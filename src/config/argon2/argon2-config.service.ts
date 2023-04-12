import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()

/**
 * Service dealing with argon2 config based operations.
 *
 * @class Argon2ConfigService
 */
export class Argon2ConfigService {
    constructor(private configService : ConfigService) {}

    public get memoryCost() : number {
        return this.configService.get<number>('argon2.memory_cost');
    }

    public get timeCost() : number {
        return this.configService.get<number>('argon2.time_cost');
    }

    public get threads() : number {
        return this.configService.get<number>('argon2.threads');
    }
}
