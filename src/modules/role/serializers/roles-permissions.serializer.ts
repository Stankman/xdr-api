import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRolesPermissions } from "../interfaces/roles-permissions.interface";
import { Expose } from "class-transformer";
import { Role } from "../entities/role.entity";
import { RolePermission } from "../entities/role-permission.entity";

export const defaultRolesPermissionsGroupsForSerializing: string[] = [
    'roles_permissions.timestamps'
];

export class RolesPermissionsSerializer extends ModelEntitySerializer implements IRolesPermissions {
    id:number;
    
    role_id: number;
    
    permission_id: number;
    
    @Expose({ groups: ['roles_permissions.timestamps'] })
    created_at: Date;

    roles : Role[];

    permissions : RolePermission[];
}