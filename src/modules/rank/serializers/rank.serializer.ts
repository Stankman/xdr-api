import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRank } from "../interfaces/rank.interface";
import { Command } from "../entities/command.entity";
import { Right } from "../entities/right.entity";

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
    commands: Command[];
    rights: Right[];
}