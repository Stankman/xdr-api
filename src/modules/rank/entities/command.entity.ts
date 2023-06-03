import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { ICommand } from "../interfaces/command.interface";
import { RankCommand } from "./rank-command.entity";

@Entity({ name: 'permission_commands' })
export class Command implements ICommand {
    @PrimaryColumn()
    name: string;

    @Column()
    description: string;

    @Column()
    keys: string;

    @OneToMany(
        () => RankCommand,
        rankCommand => rankCommand.command
    )
    rankCommands: RankCommand[];
}