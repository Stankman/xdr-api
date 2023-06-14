import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IRank } from "../interfaces/rank.interface";
import { RankCommand } from "./rank-command.entity";
import { RankRight } from "./rank-right.entity";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { Role } from "src/modules/role/entities/role.entity";
import { BooleanEnum } from "src/common/models/boolean.model";
import { BooleanTransformer } from "src/common/transformers/boolean.transformer";

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

    @Column({
        name: 'log_enabled',
        type: 'enum',
        enum: BooleanEnum,
        transformer: new BooleanTransformer()
    })
    logEnabled: boolean;

    @OneToMany(
        () => RankCommand,
        rankCommand => rankCommand.rank,
        {
            cascade: true
        }
    )
    commands: RankCommand[];

    @OneToMany(
        () => RankRight,
        rankRight => rankRight.rank,
        {
            cascade: true
        }
    )
    rights: RankRight[];

    @OneToMany(
        () => Avatar,
        avatar => avatar.rank
    )
    avatars: Avatar[];

    @OneToOne(
        () => Role, 
        role => role.rank
    )
    role: Role;
}