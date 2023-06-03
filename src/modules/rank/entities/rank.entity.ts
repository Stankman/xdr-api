import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IRank } from "../interfaces/rank.interface";
import { RankCommand } from "./rank-command.entity";
import { RankRight } from "./rank-right.entity";

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

    @OneToMany(
        () => RankCommand,
        rankCommand => rankCommand.rank
    )
    commands: RankCommand[];

    @OneToMany(
        () => RankRight,
        rankRight => rankRight.rank
    )
    rights: RankRight[];
}