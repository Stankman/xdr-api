import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRole } from "../interfaces/role.interface";
import { Expose } from "class-transformer";

export const defaultRoleGroupsForSerializing: string[] = [
    'account.timestamps'
];

export class RoleSerializer extends ModelEntitySerializer implements IRole {
    id: number;
    
    name: string;

    description: string;

    @Expose({ groups: ['account.timestamps'] })
    created_at: Date;

    @Expose({ groups: ['account.timestamps'] })
    updated_at: Date;
}