import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRight } from "../interfaces/right.interface";
import { Rank } from "../entities/rank.entity";

export class RightSerializer extends ModelEntitySerializer implements IRight {
    name: string;
    description: string;
    ranks: Rank[];
}