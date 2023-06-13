import { Expose } from "class-transformer";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IPermission } from "../interfaces/permission.interface";
import { Role } from "../entities/role.entity";

export const defaultPermissionGroupsForSerializing: string[] = [
    'role_permission.timestamps'
];

export class PermissionSerializer extends ModelEntitySerializer implements IPermission {
    name: string;

    description: string;

    roles : Role[];
}