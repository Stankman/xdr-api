import { Body, Controller, Ip, Post, UseFilters, UseInterceptors } from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { SignInDTO } from './dtos/signin.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpService } from './services/signup.service';
import { SignUpDTO } from './dtos/signup.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly signInService : SignInService,
        private readonly signUpService : SignUpService
    ) {}

    @ApiBody({ type: [SignInDTO] })
    @Post('signin')
    public async signIn(@Body() signInDTO : SignInDTO, @Ip() currentIp) : Promise<Response> {
        signInDTO.ip = currentIp;
        return this.signInService.signIn(signInDTO);
    }

    @ApiBody({ type: [SignUpDTO] })
    @Post('signUp')
    public async signUp(@Body() signUpDTO : SignUpDTO, @Ip() currentIp) : Promise<Response> {
        signUpDTO.ip = currentIp;
        return this.signUpService.signUp(signUpDTO);
    }
}