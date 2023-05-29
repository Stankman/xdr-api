import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { XdrSetting } from "../entities/xdr-setting.entity";
import { SettingSerializer } from "../serializers/setting.serializer";

@Injectable()
export class XdrSettingsRepository extends ModelRepository<XdrSetting, SettingSerializer> {
    constructor(private dataSource : DataSource) {
        super(XdrSetting, dataSource.createEntityManager());
    }
}