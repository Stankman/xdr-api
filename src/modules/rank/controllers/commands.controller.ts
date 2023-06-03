import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Command } from "../entities/command.entity";
import { CommandService } from "../services/command.service";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { FindManyOptions } from "typeorm";
import { AppConfigService } from "src/config/app/app-config.service";

@ApiTags('Commands')
@Controller('ranks/commands')
export class CommandsController {
    constructor(
        private readonly commandService : CommandService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Get('all')
    public async paginateCommands(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Command, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        let searchOptions : FindManyOptions<Command> = {}

        return await this.commandService.paginateCommands(options, searchOptions);
    }

    @Get(':name')
    public async getCommand(
        @Param() params : any
    ) : Promise<Command> {
        return await this.commandService.getCommandByName(params.name);
    }
}