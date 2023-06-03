import { ModelRepository } from "src/modules/shared/model.repository";
import { Rank } from "../entities/rank.entity";
import { RankSerializer } from "../serializers/rank.serializer";
import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RanksRepository extends ModelRepository<Rank, RankSerializer> {
    constructor(private dataSource : DataSource) {
        super(Rank, dataSource.createEntityManager());
    }

    public async getRank(value : any, column : string = 'id', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<RankSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }
}