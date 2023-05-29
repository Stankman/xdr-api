import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { ArcturusSetting } from "../entities/arcturus-setting.entity";
import { SettingSerializer } from "../serializers/setting.serializer";

@Injectable()
export class ArcturusSettingsRepository extends ModelRepository<ArcturusSetting, SettingSerializer> {
    constructor(private dataSource : DataSource) {
        super(ArcturusSetting, dataSource.createEntityManager());
    }
}