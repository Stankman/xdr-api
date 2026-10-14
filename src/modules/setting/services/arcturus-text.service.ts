import { Injectable } from "@nestjs/common";
import { ArcturusTextsRepository } from '../repositories/arcturus-texts.repository';
import { IPaginationOptions, Pagination, IPaginationMeta } from "../../../common/pagination";
import { ArcturusText } from "../entities/arcturus-text.entity";

@Injectable()
export class ArcturusTextService {
    constructor(
        private readonly repository : ArcturusTextsRepository
    ) {}

    public async paginate(options : IPaginationOptions) : Promise<Pagination<ArcturusText, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    public async getSettingByKey(key : string) : Promise<ArcturusText> {
        return await this.repository.getSetting(key);
    }
}