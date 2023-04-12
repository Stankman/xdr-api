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

    public async execute(userId : number) : Promise<string> {
        const payload : IPayload = {
            iat: Date.now(),
            uid: userId,
            iss: this.tokenConfig.issuer
        }

        return await this.jwtService.signAsync(payload);
    }
}
