import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { XdrSetting } from "../entities/xdr-setting.entity";
import { SettingsRepository } from "./settings.repository";

@Injectable()
export class XdrSettingsRepository extends SettingsRepository<XdrSetting> {
    constructor(private dataSource : DataSource) {
        super(XdrSetting, dataSource.createEntityManager());
    }
}