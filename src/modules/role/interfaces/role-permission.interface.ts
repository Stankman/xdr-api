import { Role } from "../entities/role.entity";

export interface IRolePermission {
    id : number;
    name : string;
    description : string;
    created_at : Date;
    updated_at : Date;
    roles : Role[];
}