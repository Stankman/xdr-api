import { RankCommand } from "../entities/rank-command.entity";
import { Rank } from "../entities/rank.entity";

export interface ICommand {
    name: string;
    description: string;
    keys: string;
    rankCommands: RankCommand[];
}