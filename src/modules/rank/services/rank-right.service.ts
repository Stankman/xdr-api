import { Injectable } from "@nestjs/common";
import { RankRightDTO } from "../dtos/rank-right.dto";
import { RankRight } from "../entities/rank-right.entity";
import { RankRightsRepository } from "../repositories/rank-rights.repository";
import { RightService } from "./right.service";
import { Right } from "../entities/right.entity";

@Injectable()
export class RankRightService {
    constructor(
        private readonly repository : RankRightsRepository,
        private readonly rightService : RightService
    ) {}

    public getRankRight(groupId: number, rightName: string, throwException : boolean = true) : Promise<RankRight> {
        return this.repository.getRankRight(groupId, rightName, throwException);
    }

    public async createRankRight(groupId: number, rankRightDTO : RankRightDTO) : Promise<RankRight> {
        const right : Right = await this.rightService.getRightByName(rankRightDTO.right_name);
        
        if(!right) {
            //TODO Throw Custom Exception
            return null;
        }

        const rankRight : RankRight = await this.getNewRankRight(groupId, rankRightDTO);
        return this.repository.save(rankRight);
    }

    public async editRankRight(rankRightDTO : RankRightDTO) : Promise<RankRight> {
        const rankRight : RankRight = await this.getRankRight(rankRightDTO.group_id, rankRightDTO.right_name);

        if(!rankRight) {
            return null;
        }

        rankRight.type = rankRightDTO.type;

        return this.repository.save(rankRight);
    }

    public async deleteRankRight(rankRightDTO : RankRightDTO) : Promise<boolean> {
        const rankRight : RankRight = await this.getRankRight(rankRightDTO.group_id, rankRightDTO.right_name);

        if(!rankRight) {
            return false;
        }

        this.repository.delete(rankRight);

        return true;
    }

    private async getNewRankRight(groupId: number, rankRightDTO : RankRightDTO) : Promise<RankRight> {
        const rankRight : RankRight = new RankRight();
        rankRight.groupId = groupId;
        rankRight.rightName = rankRightDTO.right_name;
        rankRight.type = rankRightDTO.type;
        return rankRight;
    }
}