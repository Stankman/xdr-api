import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Argon2ConfigService } from 'src/config/argon2/argon2-config.service';

@Injectable()
export class HashService {
    constructor(
        private readonly argon2Config : Argon2ConfigService
    ) {

    }

    public async hash(password : string) : Promise<string> {
        return await argon2.hash(
            password,
            {
                memoryCost: this.argon2Config.memoryCost,
                timeCost: this.argon2Config.timeCost,
                parallelism: this.argon2Config.threads
            }
        );
    }
}
