import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Pagination, IPaginationMeta, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AppConfigService } from 'src/config/app/app-config.service';
import { Role } from './entities/role.entity';
import { RolesService } from './services/roles.service';
import { NewRoleDTO } from './dtos/new-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { EditRoleDTO } from './dtos/edit-role.dto';
import { TogglePermissionDTO } from './dtos/toggle-permission.dto';
import { RolePermission } from './entities/role-permission.entity';
import { RolesPermissionsService } from './services/roles-permissions.service';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
    constructor(
        private readonly rolesService : RolesService,
        private readonly rolesPermissionsService : RolesPermissionsService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Roles('view-all-roles')
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

    @Roles('view-all-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get(':id')
    public async getRole(@Param() params : any) : Promise<Role> {
        return await this.rolesService.getRole(params.id, false, true);
    }

    @Roles('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Post()
    public async createRole(@Body() newRoleDTO : NewRoleDTO) : Promise<Role> {
        return await this.rolesService.createRole(newRoleDTO);
    }

    @Roles('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Put(':id')
    public async editRole(@Body() editRoleDTO : EditRoleDTO) : Promise<Role> {
        return await this.rolesService.editRole(editRoleDTO);
    }

    @Roles('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Put(':id/toggle-permission')
    public async togglePermission(@Body() togglePermissionDTO : TogglePermissionDTO) : Promise<RolePermission> {
        return await this.rolesPermissionsService.togglePermission(togglePermissionDTO);
    }

    @Roles('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Put(':id/clear-permissions')
    public async clearPermissions(@Param() params : any) : Promise<RolePermission> {
        return await this.rolesPermissionsService.clearPermissions(params.id);
    }
}
