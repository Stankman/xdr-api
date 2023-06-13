import { Role } from "../entities/role.entity";

export interface IPermission {
    name : string;
    description : string;
    roles : Role[];
}