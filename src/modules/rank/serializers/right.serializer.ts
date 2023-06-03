import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRight } from "../interfaces/right.interface";
import { RankRight } from "../entities/rank-right.entity";

export class RightSerializer extends ModelEntitySerializer implements IRight {
    name: string;
    description: string;
    rankRights: RankRight[];
}