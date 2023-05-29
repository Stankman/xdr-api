import { Injectable } from "@nestjs/common";
import { ArcturusSettingsRepository } from "../repositories/arcturus-settings.repository";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { ArcturusSetting } from "../entities/arcturus-setting.entity";
import { SettingService } from "./setting.service";

@Injectable()
export class ArcturusSettingService extends SettingService<ArcturusSetting, ArcturusSettingsRepository> {
    public async paginate(options : IPaginationOptions) : Promise<Pagination<ArcturusSetting, IPaginationMeta>> {
        return this.repository.paginate(options);
    }
}