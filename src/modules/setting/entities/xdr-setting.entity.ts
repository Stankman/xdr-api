import { Column, Entity, PrimaryColumn } from "typeorm";
import { ISetting } from "../interfaces/setting";

@Entity({ name: 'xdr_settings' })
export class XdrSetting implements ISetting {
    @PrimaryColumn()
    key: string;

    @Column()
    value: string;
}