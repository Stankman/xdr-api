import { Entity, Column, PrimaryColumn, ManyToMany } from "typeorm";
import { IRight } from "../interfaces/right.interface";
import { Rank } from "./rank.entity";

@Entity({ name: 'permission_rights' })
export class Right implements IRight {
    @PrimaryColumn()
    name: string;

    @Column()
    description: string;

    @ManyToMany(
        () => Rank,
        rank => rank.rights
    )
    ranks: Rank[];
}