import { Injectable } from "@nestjs/common";
import { NewRankRightDTO } from "../dtos/new-rank-right.dto";
import { RankRight } from "../entities/rank-right.entity";
import { RankRightsRepository } from "../repositories/rank-rights.repository";

@Injectable()
export class RankRightService {
    constructor(
        private readonly repository : RankRightsRepository
    ) {}

    public async createRankRight(newRankRightDTO : NewRankRightDTO) : Promise<RankRight> {
        const rankRight : RankRight = await this.getNewRankRight(newRankRightDTO);
        return this.repository.save(rankRight);
    }

    private async getNewRankRight(newRankRightDTO : NewRankRightDTO) : Promise<RankRight> {
        const rankRight : RankRight = new RankRight();
        rankRight.groupId = newRankRightDTO.group_id;
        rankRight.rightName = newRankRightDTO.right_name;
        rankRight.type = newRankRightDTO.type;
        return rankRight;
    }
}