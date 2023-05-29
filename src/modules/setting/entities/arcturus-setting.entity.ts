import { Column, Entity, PrimaryColumn } from "typeorm";
import { ISetting } from "../interfaces/setting";

@Entity({ name: 'emulator_settings' })
export class ArcturusSetting implements ISetting {
    @PrimaryColumn()
    key: string;

    @Column()
    value: string;
}