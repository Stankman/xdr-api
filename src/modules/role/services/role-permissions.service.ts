import { Injectable } from '@nestjs/common';
import { IPaginationOptions, Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { EditRolePermissionDTO } from '../dtos/edit-role-permission.dto';
import { NewRolePermissionDTO } from '../dtos/new-role-permission.dto';
import { RolePermission } from '../entities/role-permission.entity';
import { RolePermissionsRepository } from '../repositories/role-permissions.repository';
import { In } from 'typeorm';

@Injectable()
export class RolePermissionsService {
    constructor(
        private readonly repository : RolePermissionsRepository
    ) {}

    public async getRolePermissionById(rolePermissionId : number) : Promise<RolePermission> {
        return this.repository.getRolePermission(rolePermissionId);
    }

    public async getRolePermissionByName(rolePermissionName : string) : Promise<RolePermission> {
        return this.repository.getRolePermission(rolePermissionName, 'name');
    }

    public async getRolePermissionsByNames(rolePermissionNames : string[]) : Promise<RolePermission[]> {        
        return this.repository.findBy({
            name: In(rolePermissionNames)
        });
    }

    public async checkPermission(rolePermissionId : number) : Promise<boolean> {
        let rolePermission = this.repository.getRolePermission(rolePermissionId, 'id', false);

        if(rolePermission) {
            return true;
        }

        return false;
    }

    public async createRolePermission(newRoleDTO : NewRolePermissionDTO) : Promise<RolePermission> {
        return this.repository.save(this.getNewRolePermission(newRoleDTO));
    }
    
    public async editRolePermission(editRoleDTO : EditRolePermissionDTO) : Promise<RolePermission> {
        let role : RolePermission = await this.repository.getRolePermission(editRoleDTO.id);

        return this.repository.save(this.getEditRolePermission(role, editRoleDTO));
    }

    public async paginateRolePermissions(options : IPaginationOptions) : Promise<Pagination<RolePermission, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    private getNewRolePermission(newRolePermissionDTO : NewRolePermissionDTO) : RolePermission {
        let rolePermission : RolePermission = new RolePermission();

        rolePermission.name = newRolePermissionDTO.name;
        rolePermission.description = newRolePermissionDTO.description;
        rolePermission.created_at = new Date();

        return rolePermission;
    }

    private getEditRolePermission(rolePermission : RolePermission, editRolePermissionDTO : EditRolePermissionDTO) : RolePermission {
        rolePermission.name = editRolePermissionDTO.name;
        rolePermission.description = editRolePermissionDTO.description;

        return rolePermission;
    }
}
