import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { Role } from "src/modules/role/entities/role.entity";
import { RankCommand } from "../entities/rank-command.entity";
import { RankRight } from "../entities/rank-right.entity";

export interface IRank {
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