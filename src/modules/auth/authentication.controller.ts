import { Body, Controller, Ip, Post, UseFilters, UseInterceptors } from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { SignInDTO } from './dtos/signin.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignUpService } from './services/signup.service';
import { SignUpDTO } from './dtos/signup.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly signInService : SignInService,
        private readonly signUpService : SignUpService
    ) {}

    @Post('signin')
    public async signIn(@Body() signInDTO : SignInDTO, @Ip() currentIp) : Promise<Response> {
        return this.signInService.signIn(signInDTO, currentIp);
    }

    @Post('signUp')
    public async signUp(@Body() signUpDTO : SignUpDTO, @Ip() currentIp) : Promise<Response> {
        return this.signUpService.signUp(signUpDTO, currentIp);
    }
}