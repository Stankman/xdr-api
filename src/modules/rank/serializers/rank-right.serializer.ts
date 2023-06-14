import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRankRight } from "../interfaces/rank-right.interface";
import { Rank } from "../entities/rank.entity";
import { Right } from "../entities/right.entity";
import { Exclude } from "class-transformer";

export class RankRightSerializer extends ModelEntitySerializer implements IRankRight {
    @Exclude()
    groupId: number;
    
    rightName: string;
    
    type: number;
    
    rank: Rank;
    
    right: Right;
}