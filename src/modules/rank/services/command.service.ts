import { Injectable } from "@nestjs/common";
import { Command } from "../entities/command.entity";
import { CommandsRepository } from "../repositories/commands.repository";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindManyOptions } from "typeorm";

@Injectable()
export class CommandService {
    constructor(
        private readonly repository : CommandsRepository
    ) {}

    public async paginateCommands(options : IPaginationOptions, searchOptions? : FindManyOptions<Command>) : Promise<Pagination<Command, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getCommandByName(name: string) : Promise<Command> {
        return await this.repository.getCommand(name) ?? null;
    }
}