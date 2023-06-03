import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource, FindOptionsWhere } from "typeorm";
import { RankRight } from "../entities/rank-right.entity";
import { RankRightSerializer } from "../serializers/rank-right.serializer";

@Injectable()
export class RankRightsRepository extends ModelRepository<RankRight, RankRightSerializer> {
    constructor(private dataSource : DataSource) {
        super(RankRight, dataSource.createEntityManager());
    }

    public async getRankRight(groupId : number, rightName : string, throwsException : boolean = true) : Promise<RankRightSerializer> {
        let whereOptions : FindOptionsWhere<RankRight> = {
            groupId: groupId,
            rightName: rightName
        }
        
        return this.getOneBy(whereOptions, [], throwsException);
    }
}