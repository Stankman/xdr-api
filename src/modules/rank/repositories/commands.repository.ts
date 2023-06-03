import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { Command } from "../entities/command.entity";
import { CommandSerializer } from "../serializers/command.serializer";

@Injectable()
export class CommandsRepository extends ModelRepository<Command, CommandSerializer> {
    constructor(private dataSource : DataSource) {
        super(Command, dataSource.createEntityManager());
    }

    public async getCommand(value : any, column : string = 'name', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<CommandSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }
}