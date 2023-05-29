import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { ArcturusText } from "../entities/arcturus-text.entity";
import { SettingSerializer } from "../serializers/setting.serializer";

@Injectable()
export class ArcturusTextsRepository extends ModelRepository<ArcturusText, SettingSerializer> {
    constructor(private dataSource : DataSource) {
        super(ArcturusText, dataSource.createEntityManager());
    }
}