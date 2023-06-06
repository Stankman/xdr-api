import { Expose } from "class-transformer";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IPermission } from "../interfaces/permission.interface";
import { Role } from "../entities/role.entity";

export const defaultRolePermissionGroupsForSerializing: string[] = [
    'role_permission.timestamps'
];

export class RolePermissionSerializer extends ModelEntitySerializer implements IPermission {
    id: number;
    
    name: string;

    description: string;

    @Expose({ groups: ['role_permission.timestamps'] })
    created_at: Date;

    @Expose({ groups: ['role_permission.timestamps'] })
    updated_at: Date;

    roles : Role[];
}