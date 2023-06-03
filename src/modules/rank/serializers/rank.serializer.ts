import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRank } from "../interfaces/rank.interface";
import { RankCommand } from "../entities/rank-command.entity";
import { RankRight } from "../entities/rank-right.entity";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";

export class RankSerializer extends ModelEntitySerializer implements IRank {
    id: number;
    name: string;
    description: string;
    badge: string;
    level: number;
    prefix: string;
    prefixColor: string;
    roomEffect: number;
    logEnabled: string;
    commands: RankCommand[];
    rights: RankRight[];
    avatars: Avatar[];
}