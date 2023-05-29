import { Injectable } from "@nestjs/common";
import { XdrSettingsRepository } from "../repositories/xdr-settings.repository";
import { SettingService } from "./setting.service";
import { XdrSetting } from "../entities/xdr-setting.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";

@Injectable()
export class XdrSettingService extends SettingService<XdrSetting, XdrSettingsRepository> {
    
    public async paginate(options : IPaginationOptions) : Promise<Pagination<XdrSetting, IPaginationMeta>> {
        return this.repository.paginate(options);
    }
}