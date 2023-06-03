import { Column, Entity, PrimaryColumn } from "typeorm";
import { ICommand } from "../interfaces/command.interface";

@Entity({ name: 'permission_commands' })
export class Command implements ICommand {
    @PrimaryColumn()
    name: string;

    @Column()
    description: string;

    @Column()
    keys: string;
}