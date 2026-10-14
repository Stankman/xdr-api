import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Command } from "../entities/command.entity";
import { CommandService } from "../services/command.service";
import { Pagination, IPaginationMeta, IPaginationOptions } from "../../../common/pagination";
import { FindManyOptions } from "typeorm";
import { AppConfigService } from "src/config/app/app-config.service";
import { AuthGuard } from "src/common/guards/auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";

@ApiTags('Commands')
@Controller('ranks/commands')
@UseGuards(AuthGuard, RolesGuard)
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