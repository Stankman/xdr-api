import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, Param, HttpException, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { I18n, I18nContext } from "nestjs-i18n-2";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { AppConfigService } from "src/config/app/app-config.service";
import { User } from "./entities/user.entity";
import { UsersService } from "./services/users.service";
import { ResponseInterceptor } from "src/interceptors/response.interceptor";

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UsersController {
    
    constructor(
        private readonly usersService : UsersService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Get('')
    public async paginateBans(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<User, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        return await this.usersService.paginateUsers(options);
    }

    @Get('find/:id')
    public async getUser(@Param() params : any) : Promise<User> {
        return await this.usersService.findUser(params.id);
    }
}
