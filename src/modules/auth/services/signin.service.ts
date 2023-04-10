import { Injectable } from '@nestjs/common';
import { CustomResponseService } from 'nestjs-custom-response';
import { SignInDTO } from '../dtos/signin.dto';
import { UsersService } from 'src/modules/user/services/users.service';
import { BanService } from 'src/modules/ban/services/ban.service';
import { Ban } from 'src/modules/ban/entities/ban.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { IPayload } from '../interfaces/payload.interface';
import { TokenConfigService } from 'src/config/token/token-config.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SignInService {
    constructor(
        private readonly userService : UsersService,
        private readonly banService : BanService,
        private readonly tokenConfig : TokenConfigService,
        private readonly jwtService : JwtService
    ) {}

    public async signIn(customResponse : CustomResponseService, signInDTO : SignInDTO, currentIp : string): Promise<CustomResponseService> {
        
        let user : User = await this.userService.findUser(signInDTO.identification);

        if(!user || user.password !== signInDTO.password) {
            console.log('No encontramos una cuenta relacionada con ' + signInDTO.identification);
            return customResponse.makeErrorResponse('response.message.entityNotFound.user');
        }

        let ban : Ban = await this.banService.getBan(user.id);

        if(ban) {

            let diff = ban.ban_expire - Math.floor(new Date().getTime() / 1000);

            let hours = Math.floor(diff / 3600);

            diff = diff - hours * 3600;

            let minutes = Math.floor(diff / 60);
            let seconds = diff - minutes * 60;


            console.log('Cuenta Baneada expira en: ' + hours + ' horas ' + minutes + ' minutos con ' + seconds + ' segundos');
            return customResponse.makeResponseResponse('response.message.unauthorized.banned', null, ban);
        }

        user.ip_current = currentIp;

        // this.userService.updateUser(user);

        const payload : IPayload = {
            iat: Date.now(),
            uid: user.id,
            iss: this.tokenConfig.issuer
        }

        let access_token = { 'access_token': await this.jwtService.signAsync(payload) };

        return customResponse.makeResponseResponse('response.message.successful', 200, access_token);
    }
}
