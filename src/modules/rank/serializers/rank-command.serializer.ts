import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRankCommand } from "../interfaces/rank-command.interface";
import { Command } from "../entities/command.entity";
import { Rank } from "../entities/rank.entity";
import { Exclude } from "class-transformer";

export class RankCommandSerializer extends ModelEntitySerializer implements IRankCommand {
    @Exclude()
    groupId: number;

    commandName: string;

    type: number;

    rank: Rank;
    
    command: Command;
}