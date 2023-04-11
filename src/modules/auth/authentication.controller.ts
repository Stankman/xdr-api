import { Body, Controller, Ip, Post, UseFilters, UseInterceptors } from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { SignInDTO } from './dtos/signin.dto';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { AllExceptionsFilter } from 'src/common/exceptions/exception.filter';

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
@UseFilters(new AllExceptionsFilter())
export class AuthenticationController {
    constructor(
        private readonly signInService : SignInService
    ) {}

    @Post('signin')
    public async getUser(@Body() signInDTO : SignInDTO, @Ip() currentIp) : Promise<Response> {
        return this.signInService.signIn(signInDTO, currentIp);
    }
}