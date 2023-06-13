import { Injectable } from '@nestjs/common';
import { IPaginationOptions, Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { Role } from '../entities/role.entity';
import { RolesRepository } from '../repositories/roles.repository';
import { NewRoleDTO } from '../dtos/new-role.dto';
import { RoleDTO } from '../dtos/role.dto';
import { Permission } from '../entities/permission.entity';
import { TogglePermissionDTO } from '../dtos/toggle-permission.dto';
import { PermissionService } from './permission.service';
import { CircularReferenceException } from '../exceptions/circular-reference.exception';

@Injectable()
export class RoleService {
    constructor(
        private readonly repository : RolesRepository,
        private readonly permissionService : PermissionService
    ) {}

    public async paginateRoles(options : IPaginationOptions) : Promise<Pagination<Role, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    public async getRoleById(roleId : number, includePermissions : boolean = false, includeAccounts : boolean = false) : Promise<Role> {
        let relations : string[] = [];

        if(includePermissions) {
            relations.push('permissions');
        }

        if(includeAccounts) {
            relations.push('accounts');
        }
        
        return this.repository.getRole(roleId, 'id', relations);
    }

    public async createRole(newRoleDTO : NewRoleDTO) : Promise<Role> {
        return this.repository.save(this.getNewRole(newRoleDTO));
    }
    
    public async editRole(editRoleDTO : RoleDTO) : Promise<Role> {
        let role : Role = await this.repository.getRole(editRoleDTO.id);

        return this.repository.save(this.getEditRole(role, editRoleDTO));
    }

    public async hasPermission(role : Role, permission : Permission) {
        return role.permissions.some((p) => p.name === permission.name); 
    }

    public async togglePermission(togglePermissionDTO : TogglePermissionDTO) : Promise<Role> {
        const role : Role = await this.repository.getRole(togglePermissionDTO.roleId);
        const permission : Permission = await this.permissionService.getPermissionByName(togglePermissionDTO.permissionName);

        if(this.hasPermission(role, permission)) {
            role.permissions = role.permissions.filter((p) => p.name !== permission.name);
        } else {
            role.permissions.push(permission);
        }

        return await this.repository.save(role);
    }

    public async clearPermissions(roleId : number|string) : Promise<Role> {
        const role : Role = await this.repository.getRole(roleId);
        role.permissions = [];
        return this.repository.save(role);
    }

    private getNewRole(newRoleDTO : NewRoleDTO) : Role {
        let role : Role = new Role();

        role.name = newRoleDTO.name;
        role.description = newRoleDTO.description;
        role.created_at = new Date();

        return role;
    }

    private getEditRole(role : Role, editRoleDTO : RoleDTO) : Role {
        role.name = editRoleDTO.name;
        role.description = editRoleDTO.description;

        let roleParent: Role | undefined = role.parent;
    
        while(roleParent) {
          if(roleParent.id === role.id) {
            throw new CircularReferenceException();
          }
    
          roleParent = roleParent.parent;
        }

        return role;
    }
}
