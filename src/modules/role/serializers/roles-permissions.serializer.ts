import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IRolesPermissions } from "../interfaces/roles-permissions.interface";
import { Expose } from "class-transformer";

export const defaultRolesPermissionsGroupsForSerializing: string[] = [
    'roles_permissions.timestamps'
];

export class RolesPermissionsSerializer extends ModelEntitySerializer implements IRolesPermissions {
    id:number;
    
    role_id: number;
    
    permission_id: number;
    
    @Expose({ groups: ['roles_permissions.timestamps'] })
    created_at: Date;
}