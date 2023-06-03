import { Rank } from "../entities/rank.entity";
import { Right } from "../entities/right.entity";

export interface IRankRight {
    groupId: number;
    rightName: string;
    type: number;
    rank: Rank;
    right: Right;
}