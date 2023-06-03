import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";
import { ICommand } from "../interfaces/command.interface";
import { Rank } from "./rank.entity";

@Entity({ name: 'permission_commands' })
export class Command implements ICommand {
    @PrimaryColumn()
    name: string;

    @Column()
    description: string;

    @Column()
    keys: string;

    @ManyToMany(
        () => Rank,
        rank => rank.commands
    )
    ranks: Rank[];
}