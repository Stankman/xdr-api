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
import { DuplicateRankException } from '../exceptions/duplicate-rank.exception';
import { RankService } from 'src/modules/rank/services/rank.service';

@Injectable()
export class RoleService {
    constructor(
        private readonly repository : RolesRepository,
        private readonly permissionService : PermissionService,
        private readonly rankService : RankService
    ) {}

    public async paginateRoles(options : IPaginationOptions) : Promise<Pagination<Role, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    public async getRoleById(roleId : number, includePermissions : boolean = false, includeRank : boolean = false) : Promise<Role> {
        let relations : string[] = [];

        if(includePermissions) {
            relations.push('permissions');
        }

        if(includeRank) {
            relations.push('rank');
            relations.push('rank.avatars');
        }
        
        return this.repository.getRole(roleId, 'id', relations);
    }

    public async createRole(newRoleDTO : NewRoleDTO) : Promise<Role> {
        return this.repository.save(this.getNewRole(newRoleDTO));
    }
    
    public async editRole(roleDTO : RoleDTO) : Promise<Role> {
        return this.repository.save(await this.getRole(roleDTO));
    }

    public hasPermission(role : Role, permission : Permission) : boolean {
        return role.permissions.some((p) => p.name === permission.name); 
    }

    public async togglePermission(togglePermissionDTO : TogglePermissionDTO) : Promise<boolean> {
        const role : Role = await this.repository.getRole(togglePermissionDTO.roleId, 'id', ['permissions']);
        const permission : Permission = await this.permissionService.getPermissionByName(togglePermissionDTO.permissionName);

        if(this.hasPermission(role, permission)) {
            role.permissions = role.permissions.filter((p) => p.name !== permission.name);
        } else {
            role.permissions.push(permission);
        }

        this.repository.save(role);

        return true;
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

    private async getRole(roleDTO : RoleDTO) : Promise<Role> {
        const role : Role = await this.repository.getRole(roleDTO.id);

        role.name = roleDTO.name;
        role.description = roleDTO.description;
        role.hidden = roleDTO.hidden;

        const existingRoleWithRank = await this.repository.getRole(roleDTO.groupId, 'rank', [], false);

        if (existingRoleWithRank) {
            throw new DuplicateRankException();
        }

        const rank = await this.rankService.getRankById(roleDTO.groupId);

        role.rank = rank;

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
