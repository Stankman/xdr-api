import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IRank } from "../interfaces/rank.interface";

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
}