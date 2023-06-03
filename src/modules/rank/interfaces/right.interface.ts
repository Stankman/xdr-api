import { Rank } from "../entities/rank.entity";

export interface IRight {
    name: string;
    description: string;
    ranks: Rank[];
}