import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ArcturusText } from "../entities/arcturus-text.entity";
import { SettingsRepository } from "./settings.repository";
import { SettingSerializer } from "../serializers/setting.serializer";

@Injectable()
export class ArcturusTextsRepository extends SettingsRepository<ArcturusText> {
    constructor(private dataSource : DataSource) {
        super(ArcturusText, dataSource.createEntityManager());
    }

    public async getSetting(value : any, column : string = 'key', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<SettingSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }
}