import { Role } from "src/modules/role/entities/role.entity";

export interface IAccount {
    id: number;
    email: string;
    password: string;
    last_login : number;
    created_at: Date;
    updated_at: Date;
    roles : Role[];
}