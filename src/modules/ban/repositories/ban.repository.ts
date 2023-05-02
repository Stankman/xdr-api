import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ModelRepository } from "../../shared/model.repository";
import { Ban } from "../entities/ban.entity";
import { BanSerializer } from "../serializers/ban.serializer";

@Injectable()
export class BanRepository extends ModelRepository<Ban, BanSerializer> {
    constructor(private dataSource : DataSource) {
        super(Ban, dataSource.createEntityManager());
    }
}