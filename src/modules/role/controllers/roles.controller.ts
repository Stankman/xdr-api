import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Pagination, IPaginationMeta, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { RolePermission } from 'src/common/decorators/role-permission.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AppConfigService } from 'src/config/app/app-config.service';
import { Role } from '../entities/role.entity';
import { RoleService } from '../services/role.service';
import { NewRoleDTO } from '../dtos/new-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { RoleDTO } from '../dtos/role.dto';
import { TogglePermissionDTO } from '../dtos/toggle-permission.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService : RoleService,
        private readonly appConfigService : AppConfigService
    ) {}

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get('all')
    public async paginateRoles(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Role, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        return await this.rolesService.paginateRoles(options);
    }

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get(':id')
    public async getRole(@Param() params : any) : Promise<Role> {
        return await this.rolesService.getRoleById(params.id, true, false);
    }

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Post()
    public async createRole(@Body() newRoleDTO : NewRoleDTO) : Promise<Role> {
        return await this.rolesService.createRole(newRoleDTO);
    }

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Put(':id')
    public async updateRole(@Body() roleDTO : RoleDTO) : Promise<Role> {
        return await this.rolesService.editRole(roleDTO);
    }

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Put(':id/toggle-permission')
    public async togglePermission(@Body() togglePermissionDTO : TogglePermissionDTO) : Promise<boolean> {
        //TODO Get Request logged to log system
        return await this.rolesService.togglePermission(togglePermissionDTO);
    }

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Put(':id/clear-permissions')
    public async clearPermissions(@Param() params : any) : Promise<Role> {
        return await this.rolesService.clearPermissions(params.id);
    }
}
