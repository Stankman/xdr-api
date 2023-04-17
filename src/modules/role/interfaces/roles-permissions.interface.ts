import { RolePermission } from "../entities/role-permission.entity";
import { Role } from "../entities/role.entity";

export interface IRolesPermissions {
    id : number;
    role_id : number;
    permission_id : number;
    created_at : Date;
    roles : Role[];
    permissions : RolePermission[]
}