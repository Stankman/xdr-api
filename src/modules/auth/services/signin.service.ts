import { Injectable } from '@nestjs/common';
import { SignInDTO } from '../dtos/signin.dto';
import { UsersService } from 'src/modules/user/services/users.service';
import { BanService } from 'src/modules/ban/services/ban.service';
import { Ban } from 'src/modules/ban/entities/ban.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { IPayload } from '../interfaces/payload.interface';
import { TokenConfigService } from 'src/config/token/token-config.service';
import { JwtService } from '@nestjs/jwt';
import { CustomResponse } from '../../../common/models/custom-response.model';
import { BanException } from '../exceptions/ban.exception';
import { LoginException } from '../exceptions/login.exception';

@Injectable()
export class SignInService {
    constructor(
        private readonly userService : UsersService,
        private readonly banService : BanService,
        private readonly tokenConfig : TokenConfigService,
        private readonly jwtService : JwtService
    ) {}

    public async signIn(signInDTO : SignInDTO, currentIp : string): Promise<any> {
        
        let customResponse = new CustomResponse();

        customResponse.setCode(404);
        customResponse.setStatus('ok');

        let user : User = await this.userService.findUser(signInDTO.identification);

        if(!user || user.password !== signInDTO.password) {
            throw new LoginException();
        }

        let ban : Ban = await this.banService.getBan(user.id);

        if(ban) {
            throw new BanException();
        }

        user.ip_current = currentIp;

        const payload : IPayload = {
            iat: Date.now(),
            uid: user.id,
            iss: this.tokenConfig.issuer
        }

        let access_token = { 'access_token': await this.jwtService.signAsync(payload) };

        return access_token;
    }
}
