import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { CustomResponseService } from 'nestjs-custom-response';
import { UsersService } from './services/users.service';
import { I18n, I18nContext } from 'nestjs-i18n-2';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    
    constructor(
        private readonly usersService : UsersService
    ) {}

    @Get('find/:id')
    public async getUser(@I18n() i18n : I18nContext, @Param() params : any) : Promise<Response> {
        let customResponse = new CustomResponseService(i18n);

        customResponse = await this.usersService.getUser(customResponse, params.id);

        throw new HttpException(customResponse, customResponse.statusCode);
    }
}
