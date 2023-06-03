import { Rank } from "../entities/rank.entity";

export interface ICommand {
    name: string;
    description: string;
    keys: string;
    ranks: Rank[];
}