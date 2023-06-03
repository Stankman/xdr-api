import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { RankService } from "../services/rank.service";
import { ApiTags } from "@nestjs/swagger";
import { Rank } from "../entities/rank.entity";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { AppConfigService } from "src/config/app/app-config.service";
import { FindManyOptions } from "typeorm";
import { NewRankDTO } from "../dtos/new-rank.dto";

@ApiTags('Ranks')
@Controller('ranks')
export class RanksController {
    constructor(
        private readonly rankService : RankService,
        private readonly appConfigService : AppConfigService
    ) {}
    
    @Get('all')
    public async paginateRanks(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Rank, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        let searchOptions : FindManyOptions<Rank> = {
            relations: [
                "rights.right",
                "commands.command"
            ]
        }

        return await this.rankService.paginateRanks(options, searchOptions);
    }

    @Post()
    public async createRank(@Body() newRankDTO : NewRankDTO) : Promise<Rank> {
        return this.rankService.createRank(newRankDTO);
    }

    @Put(':id')
    public async updateRank(@Body() newRankDTO : NewRankDTO) : Promise<any> {
        //return this.rankService.editRank();
    }

    @Get(':id')
    public async getRank(
        @Param() params : any
    ) : Promise<Rank> {
        return await this.rankService.getRankById(params.id);
    }
}