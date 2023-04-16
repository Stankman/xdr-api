import { Injectable } from '@nestjs/common';
import { RolesPermissionsRepository } from '../roles-permissions.repository';
import { TogglePermissionDTO } from '../dtos/toggle-permission.dto';
import { RolePermissionsService } from './role-permissions.service';
import { RolesService } from './roles.service';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import { RolesPermissions } from '../entities/roles-permissions.entity';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class RolesPermissionsService {
    constructor(
        private readonly repository : RolesPermissionsRepository,
        private readonly rolesService : RolesService,
        private readonly rolePermissionsService : RolePermissionsService
    ) {}

    public async togglePermission(togglePermissionDTO : TogglePermissionDTO) : Promise<any> {
        let role : Role = await this.rolesService.getRole(togglePermissionDTO.role_id);

        let permission : RolePermission = await this.rolePermissionsService.getRolePermission(togglePermissionDTO.permission_id);

        let whereOptions = {
            role_id: role.id,
            permission_id: permission.id
        };

        let assignedPermission : RolesPermissions = await this.repository.getOneBy(whereOptions, [], false);

        if(assignedPermission) {
            this.repository.delete(assignedPermission.id);
        } else {
            this.repository.save(this.getNewRolesPermissions(togglePermissionDTO));
        }

        return true;
    }

    public async clearPermissions(roleId : number) : Promise<any> {
        let role : Role = await this.rolesService.getRole(roleId);
        
        this.repository.delete({
            role_id: role.id
        });

        return true;
    }

    private getNewRolesPermissions(togglePermissionDTO : TogglePermissionDTO) : RolesPermissions {
        let rolesPermissions : RolesPermissions = new RolesPermissions();

        rolesPermissions.role_id = togglePermissionDTO.role_id;
        rolesPermissions.permission_id = togglePermissionDTO.permission_id;
        rolesPermissions.created_at = new Date();

        return rolesPermissions;
    }
}
