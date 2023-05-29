import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ArcturusText } from "../entities/arcturus-text.entity";
import { SettingsRepository } from "./settings.repository";

@Injectable()
export class ArcturusTextsRepository extends SettingsRepository<ArcturusText> {
    constructor(private dataSource : DataSource) {
        super(ArcturusText, dataSource.createEntityManager());
    }
}