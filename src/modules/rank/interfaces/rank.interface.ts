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
    logEnabled: boolean;
    commands: RankCommand[];
    rights: RankRight[];
}