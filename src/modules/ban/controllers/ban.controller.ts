import { Controller, UseInterceptors, Get, Query, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import { Pagination, IPaginationMeta, IPaginationOptions } from "../../../common/pagination";
import { AppConfigService } from "src/config/app/app-config.service";
import { Ban } from "../entities/ban.entity";
import { BanService } from "../services/ban.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Bans')
@Controller('bans')
export class BanController {
    constructor(
        private readonly banService : BanService,
        private readonly appConfigService : AppConfigService
        ) {}

    @Get('')
    public async getBan(
        @Query('value', new DefaultValuePipe('0')) value : string = '0'
    ) : Promise<Ban> {
        return await this.banService.getBan(value);
    }

    @Get('all')
    public async paginateBans(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Ban, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        return this.banService.paginateBans(options);
    }
}
