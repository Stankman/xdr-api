import { Command } from "../entities/command.entity";
import { Right } from "../entities/right.entity";

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
    commands: Command[];
    rights: Right[];
}