import { Injectable } from "@nestjs/common";
import { RanksRepository } from "../repositories/ranks.repository";
import { Rank } from "../entities/rank.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, FindManyOptions } from "typeorm";
import { NewRankDTO } from '../dtos/new-rank.dto';

@Injectable()
export class RankService {
    constructor(
        private readonly repository : RanksRepository,
    ) {}

    public async paginateRanks(options : IPaginationOptions, searchOptions? : FindOptionsWhere<Rank> | FindManyOptions<Rank>) : Promise<Pagination<Rank, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getRankById(id: number|string) : Promise<Rank> {
        let relations : string[] = [];
        
        return await this.repository.getRank(id, 'id', relations) ?? null;
    }

    public async createRank(newRankDTO : NewRankDTO) : Promise<Rank> {
        const rank : Rank = await this.getNewRank(newRankDTO);

        for(let command of newRankDTO.commands) {
        }

        return await this.repository.save(rank);
    }

    private async getNewRank(newRankDTO : NewRankDTO) : Promise<Rank> {
        const rank : Rank = new Rank();
        rank.name = newRankDTO.name;
        rank.description = newRankDTO.description;
        rank.prefix = newRankDTO.prefix;
        rank.prefixColor = newRankDTO.prefix_color;
        rank.roomEffect = newRankDTO.room_effect;
        rank.logEnabled = newRankDTO.log_enabled;
        rank.commands = [];
        rank.rights = [];
        return rank;
    }
}