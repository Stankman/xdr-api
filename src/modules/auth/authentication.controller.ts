import { Body, Controller, Get, HttpException, Ip, Post, Res, UseInterceptors } from '@nestjs/common';
import { SignInService } from './services/signin.service';
import { SignInDTO } from './dtos/signin.dto';
import { Response } from 'express';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { CustomResponse } from 'src/common/models/custom-response.model';

@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly signInService : SignInService
    ) {}

    @Post('signin')
    @UseInterceptors(ResponseInterceptor)
    public async getUser(@Body() signInDTO : SignInDTO, @Ip() currentIp, @Res() response : Response) : Promise<any> {
        return this.signInService.signIn(signInDTO, currentIp);
    }
}