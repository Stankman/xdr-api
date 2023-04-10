/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, DefaultValuePipe, Get, HttpException, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { BanService } from './services/ban.service';
import { AppConfigService } from 'src/config/app/app-config.service';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { I18n, I18nContext } from 'nestjs-i18n-2';
import { CustomResponseService } from 'nestjs-custom-response';

@Controller('bans')
export class BanController {
    constructor(
        private readonly banService : BanService,
        private readonly appConfigService : AppConfigService
        ) {}

    @Get('')
    public async paginateBans(@I18n() i18n : I18nContext, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10) : Promise<Response> {

        let customResponse = new CustomResponseService(i18n);

        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        customResponse = await this.banService.paginateBans(customResponse, options);

        throw new HttpException(customResponse, customResponse.statusCode);
    }
}
