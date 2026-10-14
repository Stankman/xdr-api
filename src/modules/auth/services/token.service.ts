import { Injectable } from '@nestjs/common';
import { TokenConfigService } from '../../../config/token/token-config.service';
import { JwtService } from '@nestjs/jwt';
import { IPayload } from '../interfaces/payload.interface';

@Injectable()
export class TokenService {
    constructor(
        private readonly tokenConfig : TokenConfigService,
        private readonly jwtService : JwtService
    ) {}

    public async execute(userId : number, sessionId?: string) : Promise<string> {
        if (!sessionId) {
            throw new Error('An active website session is required to issue an access token.');
        }
        // iat and iss are added by JwtService signOptions.
        const payload : IPayload = {
            uid: userId,
            sid: sessionId,
        }

        return await this.jwtService.signAsync(payload);
    }
}
