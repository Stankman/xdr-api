import { Injectable } from "@nestjs/common";
import { ArcturusTextsRepository } from '../repositories/arcturus-texts.repository';
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { ArcturusText } from "../entities/arcturus-text.entity";
import { SettingService } from "./setting.service";

@Injectable()
export class ArcturusTextService extends SettingService<ArcturusText, ArcturusTextsRepository> {
    public async paginate(options : IPaginationOptions) : Promise<Pagination<ArcturusText, IPaginationMeta>> {
        return this.repository.paginate(options);
    }
}