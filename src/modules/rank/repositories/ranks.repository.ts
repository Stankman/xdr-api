import { ModelRepository } from "src/modules/shared/model.repository";
import { Rank } from "../entities/rank.entity";
import { RankSerializer } from "../serializers/rank.serializer";
import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { plainToInstance, instanceToPlain } from "class-transformer";

@Injectable()
export class RanksRepository extends ModelRepository<Rank, RankSerializer> {
    constructor(private dataSource : DataSource) {
        super(Rank, dataSource.createEntityManager());
    }

    public async getRank(value : any, column : string = 'id', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<RankSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }

    public transform(model: Rank, transformOptions : any = {}): RankSerializer {
        return plainToInstance(RankSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: Rank[], transformOptions : any = {}): RankSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}