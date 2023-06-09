import { RolePermission } from "../entities/role-permission.entity";

export interface IRole {
    id : number;
    name : string;
    description : string;
    created_at : Date;
    updated_at : Date;
    permissions : RolePermission[];
}