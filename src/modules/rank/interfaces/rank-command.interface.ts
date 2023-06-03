import { Command } from "../entities/command.entity";
import { Rank } from "../entities/rank.entity";

export interface IRankCommand {
    groupId: number;
    commandName: string;
    type: number;
    rank: Rank;
    command: Command;
}