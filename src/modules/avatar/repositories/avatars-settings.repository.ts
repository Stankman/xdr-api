import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { AvatarSettings } from "../entities/avatar-settings.entity";
import { AvatarSettingsSerializer } from "../serializers/avatar-settings.serializer";

@Injectable()
export class AvatarsSettingsRepository extends ModelRepository<AvatarSettings, AvatarSettingsSerializer> {
    constructor(private dataSource : DataSource) {
        super(AvatarSettings, dataSource.createEntityManager());
    }
}