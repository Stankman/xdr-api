import { Body, Controller, Get, HttpException, Ip, Post, Res } from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { CustomResponseService } from 'nestjs-custom-response';
import { I18n, I18nContext } from 'nestjs-i18n-2';
import { SignInDTO } from './dtos/signin.dto';

@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly signInService : SignInService
    ) {}

    @Post('signin')
    public async getUser(@I18n() i18n : I18nContext, @Body() signInDTO : SignInDTO, @Ip() currentIp) : Promise<Response> {
        let customResponse = new CustomResponseService(i18n);

        customResponse = await this.signInService.signIn(customResponse, signInDTO, currentIp);

        throw new HttpException(customResponse, customResponse.statusCode);
    }
}