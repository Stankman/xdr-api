import { Entity, PrimaryColumn, Column } from "typeorm";
import { ISetting } from "../interfaces/setting";

@Entity({ name: 'emulator_texts' })
export class ArcturusText implements ISetting {
    @PrimaryColumn()
    key: string;

    @Column()
    value: string;
}