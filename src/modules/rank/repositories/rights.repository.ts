import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { Right } from "../entities/right.entity";
import { RightSerializer } from "../serializers/right.serializer";

@Injectable()
export class RightsRepository extends ModelRepository<Right, RightSerializer> {
    constructor(private dataSource : DataSource) {
        super(Right, dataSource.createEntityManager());
    }

    public async getRight(value : any, column : string = 'name', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<RightSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }
}