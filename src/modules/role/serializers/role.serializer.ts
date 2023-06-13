import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRole } from "../interfaces/role.interface";
import { Exclude, Expose } from "class-transformer";
import { Permission } from "../entities/permission.entity";
import { Rank } from "src/modules/rank/entities/rank.entity";
import { Role } from "../entities/role.entity";

export const defaultRoleGroupsForSerializing: string[] = [
    'role.timestamps'
];

export class RoleSerializer extends ModelEntitySerializer implements IRole {
    id: number;
    
    name: string;

    description: string;

    hidden: boolean;

    @Expose({ groups: ['role.timestamps'] })
    created_at: Date;

    @Expose({ groups: ['role.timestamps'] })
    updated_at: Date;

    rank: Rank;

    permissions: Permission[];

    parent: Role;

    children: Role[];
}