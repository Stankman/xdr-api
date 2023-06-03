import { Entity, PrimaryColumn, Column, ManyToMany, JoinColumn, ManyToOne } from "typeorm";
import { IRankCommand } from "../interfaces/rank-command.interface";
import { Rank } from "./rank.entity";
import { Command } from "./command.entity";

@Entity({ name: 'permission_group_commands' })
export class RankCommand implements IRankCommand {
    @PrimaryColumn({ name: "group_id" })
    groupId: number;

    @PrimaryColumn({ name: "command_name" })
    commandName: string;

    @Column({ name: "setting_type" })
    type: number;

    @JoinColumn({ name: "group_id" })
    @ManyToOne(
        () => Rank,
        rank => rank.id
    )
    rank: Rank;

    @JoinColumn({ name: "command_name" })
    @ManyToOne(
        () => Command,
        command => command.name
    )
    command: Command;
}