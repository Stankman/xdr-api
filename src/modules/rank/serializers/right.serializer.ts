import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRight } from "../interfaces/right.interface";

export class RightSerializer extends ModelEntitySerializer implements IRight {
    name: string;
    description: string;
}