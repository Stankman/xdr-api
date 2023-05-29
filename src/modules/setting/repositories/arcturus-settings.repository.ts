import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ArcturusSetting } from "../entities/arcturus-setting.entity";
import { SettingSerializer } from "../serializers/setting.serializer";
import { ModelRepository } from "src/modules/shared/model.repository";

@Injectable()
export class ArcturusSettingsRepository extends ModelRepository<ArcturusSetting, SettingSerializer> {
    constructor(private dataSource : DataSource) {
        super(ArcturusSetting, dataSource.createEntityManager());
    }

    public async getSetting(value : any, column : string = 'key', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<SettingSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }
}