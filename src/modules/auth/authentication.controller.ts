import { Body, Controller, Ip, Post, UseInterceptors } from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { SignInDTO } from './dtos/signin.dto';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthenticationController {
    constructor(
        private readonly signInService : SignInService
    ) {}

    @Post('signin')
    public async getUser(@Body() signInDTO : SignInDTO, @Ip() currentIp) : Promise<Response> {
        return this.signInService.signIn(signInDTO, currentIp);
    }
}