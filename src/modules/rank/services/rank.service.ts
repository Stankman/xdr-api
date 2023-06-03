import { Injectable } from "@nestjs/common";
import { RanksRepository } from "../repositories/ranks.repository";
import { Rank } from "../entities/rank.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, FindManyOptions } from "typeorm";

@Injectable()
export class RankService {
    constructor(
        private readonly repository : RanksRepository
    ) {}

    public async paginateRanks(options : IPaginationOptions, searchOptions? : FindOptionsWhere<Rank> | FindManyOptions<Rank>) : Promise<Pagination<Rank, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getRankById(id: number|string) : Promise<Rank> {
        let relations : string[] = [];
        
        return await this.repository.getRank(id, 'id', relations) ?? null;
    }
}