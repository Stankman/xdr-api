import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { XdrSetting } from "../entities/xdr-setting.entity";
import { SettingsRepository } from "./settings.repository";
import { SettingSerializer } from "../serializers/setting.serializer";

@Injectable()
export class XdrSettingsRepository extends SettingsRepository<XdrSetting> {
    constructor(private dataSource : DataSource) {
        super(XdrSetting, dataSource.createEntityManager());
    }

    public async getSetting(value : any, column : string = 'key', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<SettingSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }
}