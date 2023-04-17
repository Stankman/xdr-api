import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRole } from "../interfaces/role.interface";
import { Expose } from "class-transformer";
import { RolePermission } from "../entities/role-permission.entity";

export const defaultRoleGroupsForSerializing: string[] = [
    'role.timestamps'
];

export class RoleSerializer extends ModelEntitySerializer implements IRole {
    id: number;
    
    name: string;

    description: string;

    @Expose({ groups: ['role.timestamps'] })
    created_at: Date;

    @Expose({ groups: ['role.timestamps'] })
    updated_at: Date;

    permissions: RolePermission[];
}