import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { IRank } from "../interfaces/rank.interface";
import { Command } from "./command.entity";
import { Right } from "./right.entity";

@Entity({ name: 'permission_groups' })
export class Rank implements IRank {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    level: number;

    @Column()
    prefix: string;

    @Column({ name: 'prefix_color' })
    prefixColor: string;

    @Column()
    badge: string;

    @Column({ name: 'room_effect' })
    roomEffect: number;

    @Column({ name: 'log_enabled' })
    logEnabled: boolean;

    @ManyToMany(
        () => Command,
        command => command.ranks
    )
    @JoinTable({
        name: 'permission_group_commands',
        joinColumn: {
            name: 'group_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'command_name',
            referencedColumnName: 'name',
        },
    })
    commands: Command[];

    @ManyToMany(
        () => Right,
        right => right.ranks
    )
    @JoinTable({
        name: 'permission_group_rights',
        joinColumn: {
            name: 'group_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'right_name',
            referencedColumnName: 'name',
        },
    })
    rights: Right[];
}