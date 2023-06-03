import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource, FindOptionsWhere } from "typeorm";
import { RankCommand } from "../entities/rank-command.entity";
import { RankCommandSerializer } from "../serializers/rank-command.serializer";

@Injectable()
export class RankCommandsRepository extends ModelRepository<RankCommand, RankCommandSerializer> {
    constructor(private dataSource : DataSource) {
        super(RankCommand, dataSource.createEntityManager());
    }

    public async getRankCommand(groupId : number, commandName : string, throwsException : boolean = true) : Promise<RankCommandSerializer> {
        let whereOptions : FindOptionsWhere<RankCommand> = {
            groupId: groupId,
            commandName: commandName
        }
        
        return this.getOneBy(whereOptions, [], throwsException);
    }
}