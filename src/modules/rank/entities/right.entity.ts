import { Entity, Column, PrimaryColumn } from "typeorm";
import { IRight } from "../interfaces/right.interface";

@Entity({ name: 'permission_rights' })
export class Right implements IRight {
    @PrimaryColumn()
    name: string;

    @Column()
    description: string;
}