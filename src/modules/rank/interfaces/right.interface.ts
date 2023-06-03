import { RankRight } from "../entities/rank-right.entity";
import { Rank } from "../entities/rank.entity";

export interface IRight {
    name: string;
    description: string;
    rankRights: RankRight[];
}