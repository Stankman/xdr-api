import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { SettingSerializer } from "../serializers/setting.serializer";

@Injectable()
export class SettingsRepository<T> extends ModelRepository<T, SettingSerializer> {}