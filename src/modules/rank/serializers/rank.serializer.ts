import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { Role } from "src/modules/role/entities/role.entity";
import { RankCommand } from "../entities/rank-command.entity";
import { RankRight } from "../entities/rank-right.entity";
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
    logEnabled: string;
    commands: RankCommand[];
    rights: RankRight[];
    avatars: Avatar[];
    role: Role;
}