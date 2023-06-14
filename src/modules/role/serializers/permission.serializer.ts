import { Expose, Type } from "class-transformer";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IPermission } from "../interfaces/permission.interface";
import { Role } from "../entities/role.entity";
import { RoleSerializer } from "./role.serializer";

export const extendedPermissionGroupsForSerializing: string[] = [
    'permission.description'
];

export class PermissionSerializer extends ModelEntitySerializer implements IPermission {
    name: string;

    @Expose({ groups: ['permission.description'] })
    description: string;

    @Type(() => RoleSerializer)
    roles : Role[];
}