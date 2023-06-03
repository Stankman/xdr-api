import { Injectable } from "@nestjs/common";
import { RankCommand } from "../entities/rank-command.entity";
import { RankCommandsRepository } from "../repositories/rank-commands.repository";
import { RankCommandDTO } from "../dtos/rank-command.dto";
import { CommandService } from "./command.service";
import { Command } from "../entities/command.entity";

@Injectable()
export class RankCommandService {
    constructor(
        private readonly repository : RankCommandsRepository,
        private readonly commandService : CommandService
    ) {}

    public getRankCommand(groupId: number, commandName: string, throwException : boolean = true) : Promise<RankCommand> {
        return this.repository.getRankCommand(groupId, commandName, throwException);
    }

    public async createRankCommand(groupId : number, rankCommandDTO : RankCommandDTO) : Promise<RankCommand> {
        const command : Command = await this.commandService.getCommandByName(rankCommandDTO.command_name);
        
        if(!command) {
            //TODO Throw Custom Exception
            return null;
        }

        const rankCommand : RankCommand = await this.getNewRankCommand(groupId, rankCommandDTO);
        return this.repository.save(rankCommand);
    }

    public async editRankCommand(rankCommandDTO : RankCommandDTO) : Promise<RankCommand> {
        const rankCommand : RankCommand = await this.getRankCommand(rankCommandDTO.group_id, rankCommandDTO.command_name);

        if(!rankCommand) {
            //TODO Throw Custom Exception
            return null;
        }

        rankCommand.type = rankCommandDTO.type;

        return this.repository.save(rankCommand);
    }

    public async deleteRankCommand(rankCommandDTO : RankCommandDTO) : Promise<boolean> {
        const rankCommand : RankCommand = await this.getRankCommand(rankCommandDTO.group_id, rankCommandDTO.command_name);

        if(!rankCommand) {
            return false;
        }

        this.repository.delete(rankCommand);

        return true;
    }

    private async getNewRankCommand(groupId : number, rankCommandDTO : RankCommandDTO) : Promise<RankCommand> {
        const rankCommand : RankCommand = new RankCommand();
        rankCommand.groupId = groupId;
        rankCommand.commandName = rankCommandDTO.command_name;
        rankCommand.type = rankCommandDTO.type;
        return rankCommand;
    }
}