import { Injectable } from "@nestjs/common";
import { ArcturusSettingsRepository } from "../repositories/arcturus-settings.repository";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { ArcturusSetting } from "../entities/arcturus-setting.entity";

@Injectable()
export class ArcturusSettingService {
    constructor(
        private readonly repository : ArcturusSettingsRepository
    ) {}

    public async paginate(options : IPaginationOptions) : Promise<Pagination<ArcturusSetting, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    public async getSettingByKey(key : string) : Promise<ArcturusSetting> {
        return await this.repository.getSetting(key);
    }
}