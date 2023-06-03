import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRank } from "../interfaces/rank.interface";

export class RankSerializer extends ModelEntitySerializer implements IRank {
    id: number;
    name: string;
    description: string;
    badge: string;
    level: number;
    prefix: string;
    prefixColor: string;
    roomEffect: number;
    logEnabled: boolean;
}