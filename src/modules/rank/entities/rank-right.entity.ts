import { Entity, PrimaryColumn, Column, ManyToMany, JoinColumn, ManyToOne } from "typeorm";
import { IRankRight } from "../interfaces/rank-right.interface";
import { Rank } from "./rank.entity";
import { Right } from "./right.entity";

@Entity({ name: 'permission_group_rights' })
export class RankRight implements IRankRight {
    @PrimaryColumn({ name: "group_id" })
    groupId: number;

    @PrimaryColumn({ name: "right_name" })
    rightName: string;

    @Column({ name: "setting_type" })
    type: number;

    @JoinColumn({ name: "group_id" })
    @ManyToOne(
        () => Rank,
        rank => rank.id
    )
    rank: Rank;

    @JoinColumn({ name: "right_name" })
    @ManyToOne(
        () => Right,
        right => right.name
    )
    right: Right;
}