import { Injectable } from '@nestjs/common';
import { IPaginationOptions, Pagination, IPaginationMeta } from '../../../common/pagination';
import { PermissionDTO } from '../dtos/permission.dto';
import { NewPermissionDTO } from '../dtos/new-permission.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { In } from 'typeorm';

@Injectable()
export class PermissionService {
    constructor(
        private readonly repository : PermissionsRepository
    ) {}

    public async getPermissionByName(name : string) : Promise<Permission> {
        return this.repository.getPermission(name);
    }

    public async getPermissionsByNames(names : string[]) : Promise<Permission[]> {        
        return this.repository.findBy({
            name: In(names)
        });
    }

    public async permissionExists(name : string) : Promise<boolean> {
        return !!this.repository.getPermission(name, 'name', false);
    }

    public async createPermission(newPermissionDTO : NewPermissionDTO) : Promise<Permission> {
        return this.repository.save(await this.getNewPermission(newPermissionDTO));
    }
    
    public async editPermission(permissionDTO : PermissionDTO) : Promise<Permission> {
        return this.repository.save(await this.getPermission(permissionDTO));
    }

    public async paginatePermissions(options : IPaginationOptions) : Promise<Pagination<Permission, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    private async getNewPermission(newPermissionDTO : NewPermissionDTO) : Promise<Permission> {
        const permission : Permission = new Permission();

        permission.name = newPermissionDTO.name;
        permission.description = newPermissionDTO.description;

        return permission;
    }

    private async getPermission(permissionDTO : PermissionDTO) : Promise<Permission> {
        const permission : Permission = await this.repository.getPermission(permissionDTO.name);
        
        permission.description = permissionDTO.description;

        return permission;
    }
}
