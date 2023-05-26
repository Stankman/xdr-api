import { Body, Controller, Ip, Post, UseFilters, UseInterceptors } from '@nestjs/common';
import { SignInService } from '../services/signin.service';
import { SignInDTO } from '../dtos/signin.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpService } from '../services/signup.service';
import { NewAccountDTO } from 'src/modules/account/dtos/new-account.dto';

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

    @ApiBody({ type: [NewAccountDTO] })
    @Post('signUp')
    public async signUp(@Body() newAccountDTO : NewAccountDTO, @Ip() currentIp) : Promise<Response> {
        newAccountDTO.ip = currentIp;
        return this.signUpService.signUp(newAccountDTO);
    }

    @Post('signOut')
    public async signOut() : Promise<Response> {
        return;
    }
}