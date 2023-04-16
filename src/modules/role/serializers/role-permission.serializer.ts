import { Expose } from "class-transformer";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRolePermission } from "../interfaces/role-permission.interface";

export const defaultRolePermissionGroupsForSerializing: string[] = [
    'role_permission.timestamps'
];

export class RolePermissionSerializer extends ModelEntitySerializer implements IRolePermission {
    id: number;
    
    name: string;

    description: string;

    @Expose({ groups: ['role_permission.timestamps'] })
    created_at: Date;

    @Expose({ groups: ['role_permission.timestamps'] })
    updated_at: Date;
}