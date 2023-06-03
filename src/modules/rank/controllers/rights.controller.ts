import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { AppConfigService } from "src/config/app/app-config.service";
import { FindManyOptions } from "typeorm";
import { Right } from "../entities/right.entity";
import { RightService } from "../services/right.service";

@ApiTags('Rights')
@Controller('ranks/rights')
export class RightsController {
    constructor(
        private readonly rightService : RightService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Get('all')
    public async paginateRights(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Right, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        let searchOptions : FindManyOptions<Right> = {}

        return await this.rightService.paginateRights(options, searchOptions);
    }

    @Get(':name')
    public async getRight(
        @Param() params : any
    ) : Promise<Right> {
        return await this.rightService.getRightByName(params.name);
    }
}