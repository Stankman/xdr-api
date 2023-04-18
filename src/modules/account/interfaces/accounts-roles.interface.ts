import { Role } from "src/modules/role/entities/role.entity";
import { Account } from "../entities/account.entity";

export interface IAccountsRoles {
    id : number;
    account_id : number;
    role_id : number;
    created_at : Date;
    accounts : Account[];
    roles : Role[];
}