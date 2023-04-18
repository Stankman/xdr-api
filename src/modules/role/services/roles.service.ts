import { Injectable } from '@nestjs/common';
import { IPaginationOptions, Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { Role } from '../entities/role.entity';
import { RolesRepository } from '../roles.repository';
import { NewRoleDTO } from '../dtos/new-role.dto';
import { EditRoleDTO } from '../dtos/edit-role.dto';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolesService {
    constructor(
        private readonly repository : RolesRepository
    ) {}

    public async getRole(roleId : number, includePermissions : boolean = false, includeAccounts : boolean = false) : Promise<Role> {
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
    
    public async editRole(editRoleDTO : EditRoleDTO) : Promise<Role> {
        let role : Role = await this.repository.getRole(editRoleDTO.id);

        return this.repository.save(this.getEditRole(role, editRoleDTO));
    }

    public async paginateRoles(options : IPaginationOptions) : Promise<Pagination<Role, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    public async hasPermission(roleId : number, permissionName : string) {
        let role : Role = await this.getRole(roleId);

        let rolePermission : RolePermission = role.permissions.find((permission : RolePermission) => {
            permission.name === permissionName;
        });

        return !!rolePermission; 
    }

    private getNewRole(newRoleDTO : NewRoleDTO) : Role {
        let role : Role = new Role();

        role.name = newRoleDTO.name;
        role.description = newRoleDTO.description;
        role.created_at = new Date();

        return role;
    }

    private getEditRole(role : Role, editRoleDTO : EditRoleDTO) : Role {
        role.name = editRoleDTO.name;
        role.description = editRoleDTO.description;

        return role;
    }
}
