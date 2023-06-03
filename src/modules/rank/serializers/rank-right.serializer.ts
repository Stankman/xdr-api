import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRankRight } from "../interfaces/rank-right.interface";
import { Rank } from "../entities/rank.entity";
import { Right } from "../entities/right.entity";

export class RankRightSerializer extends ModelEntitySerializer implements IRankRight {
    groupId: number;
    rightName: string;
    type: number;
    rank: Rank;
    right: Right;
}