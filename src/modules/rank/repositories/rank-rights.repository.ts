import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { RankRight } from "../entities/rank-right.entity";
import { RankRightSerializer } from "../serializers/rank-right.serializer";

@Injectable()
export class RankRightsRepository extends ModelRepository<RankRight, RankRightSerializer> {
    constructor(private dataSource : DataSource) {
        super(RankRight, dataSource.createEntityManager());
    }
}