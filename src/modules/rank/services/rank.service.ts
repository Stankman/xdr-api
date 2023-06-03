import { Injectable } from "@nestjs/common";
import { RanksRepository } from "../repositories/ranks.repository";
import { Rank } from "../entities/rank.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, FindManyOptions } from "typeorm";
import { NewRankDTO } from '../dtos/new-rank.dto';
import { RankRightService } from "./rank-right.service";
import { RankCommandService } from "./rank-command.service";
import { RankCommand } from "../entities/rank-command.entity";
import { RankRight } from "../entities/rank-right.entity";
import { RankCommandDTO } from "../dtos/rank-command.dto";
import { RankRightDTO } from "../dtos/rank-right.dto";

@Injectable()
export class RankService {
    constructor(
        private readonly repository : RanksRepository,
        private readonly rankCommandService : RankCommandService,
        private readonly rankRightService : RankRightService
    ) {}

    public async paginateRanks(options : IPaginationOptions, searchOptions? : FindOptionsWhere<Rank> | FindManyOptions<Rank>) : Promise<Pagination<Rank, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getRankById(id: number|string) : Promise<Rank> {
        let relations : string[] = [];
        
        return await this.repository.getRank(id, 'id', relations) ?? null;
    }

    public async createRank(newRankDTO : NewRankDTO) : Promise<Rank> {
        let rank : Rank = await this.getNewRank(newRankDTO);
        rank = await this.repository.save(rank);

        if(newRankDTO.commands) {
            for(let command of newRankDTO.commands) {
                const rankCommand : RankCommand = await this.rankCommandService.createRankCommand(rank.id, command);
                
                if(!rankCommand) {
                    continue;
                }
    
                rank.commands.push(rankCommand);
            }
        }

        if(newRankDTO.rights) {
            for(let right of newRankDTO.rights) {
                const rankright : RankRight = await this.rankRightService.createRankRight(rank.id, right);
                
                if(!rankright) {
                    continue;
                }
    
                rank.rights.push(rankright);
            }
        }

        return rank;
    }

    public async editRank(id : number, newRankDTO : NewRankDTO) {
        const rank : Rank = await this.getRankById(id);

        if(!rank) {
            return null;
        }

        
    }

    public async addCommand(rankCommandDTO : RankCommandDTO) : Promise<Rank> {
        const rank : Rank = await this.getRankById(rankCommandDTO.group_id);

        if(!rank) {
            return null;
        }

        const rankCommand : RankCommand = await this.rankCommandService.createRankCommand(rankCommandDTO.group_id, rankCommandDTO);
            
        if(!rankCommand) {
            return null;
        }

        rank.commands.push(rankCommand);

        return this.repository.save(rank);
    }

    public async addRight(rankRightDTO : RankRightDTO) : Promise<Rank> {
        const rank : Rank = await this.getRankById(rankRightDTO.group_id);

        if(!rank) {
            return null;
        }

        const rankRight : RankRight = await this.rankRightService.createRankRight(rankRightDTO.group_id, rankRightDTO);
            
        if(!rankRight) {
            return null;
        }

        rank.rights.push(rankRight);

        return this.repository.save(rank);
    }

    private async getNewRank(newRankDTO : NewRankDTO) : Promise<Rank> {
        const rank : Rank = new Rank();
        rank.name = newRankDTO.name;
        rank.description = newRankDTO.description;
        rank.prefix = newRankDTO.prefix;
        rank.prefixColor = newRankDTO.prefix_color;
        rank.roomEffect = newRankDTO.room_effect;
        rank.logEnabled = newRankDTO.log_enabled ? '1' : '0';
        rank.commands = [];
        rank.rights = [];

        return rank;
    }
}