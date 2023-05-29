import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ArcturusSetting } from "../entities/arcturus-setting.entity";
import { SettingsRepository } from "./settings.repository";

@Injectable()
export class ArcturusSettingsRepository extends SettingsRepository<ArcturusSetting> {
    constructor(private dataSource : DataSource) {
        super(ArcturusSetting, dataSource.createEntityManager());
    }
}