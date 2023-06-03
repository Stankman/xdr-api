import { Injectable } from "@nestjs/common";
import { RankCommand } from "../entities/rank-command.entity";
import { RankCommandsRepository } from "../repositories/rank-commands.repository";
import { NewRankCommandDTO } from "../dtos/new-rank-command.dto";

@Injectable()
export class RankCommandService {
    constructor(
        private readonly repository : RankCommandsRepository
    ) {}

    public async createRankCommand(newRankCommandDTO : NewRankCommandDTO) : Promise<RankCommand> {
        const rankCommand : RankCommand = await this.getNewRankCommand(newRankCommandDTO);
        return this.repository.save(rankCommand);
    }

    private async getNewRankCommand(newRankCommandDTO : NewRankCommandDTO) : Promise<RankCommand> {
        const rankCommand : RankCommand = new RankCommand();
        rankCommand.groupId = newRankCommandDTO.group_id;
        rankCommand.commandName = newRankCommandDTO.command_name;
        rankCommand.type = newRankCommandDTO.type;
        return rankCommand;
    }
}