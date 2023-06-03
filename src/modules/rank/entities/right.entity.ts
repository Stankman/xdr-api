import { Entity, Column, PrimaryColumn, ManyToMany, OneToMany } from "typeorm";
import { IRight } from "../interfaces/right.interface";
import { RankRight } from "./rank-right.entity";

@Entity({ name: 'permission_rights' })
export class Right implements IRight {
    @PrimaryColumn()
    name: string;

    @Column()
    description: string;

    @OneToMany(
        () => RankRight,
        rankRight => rankRight.right
    )
    rankRights: RankRight[];
}