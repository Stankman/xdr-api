import { Injectable } from "@nestjs/common";
import { Right } from "../entities/right.entity";
import { RightsRepository } from "../repositories/rights.repository";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindManyOptions } from "typeorm";

@Injectable()
export class RightService {
    constructor(
        private readonly repository : RightsRepository
    ) {}

    public async paginateRights(options : IPaginationOptions, searchOptions? : FindManyOptions<Right> | FindManyOptions<Right>) : Promise<Pagination<Right, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getRightByName(name: string) : Promise<Right> {
        return await this.repository.getRight(name) ?? null;
    }
}