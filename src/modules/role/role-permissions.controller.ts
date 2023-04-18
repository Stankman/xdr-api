import { Controller, UseGuards, Get, Query, DefaultValuePipe, ParseIntPipe, Param, Post, Body, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { Permission } from "src/common/decorators/permission.decorator";
import { AuthGuard } from "src/common/guards/auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AppConfigService } from "src/config/app/app-config.service";
import { EditRolePermissionDTO } from "./dtos/edit-role-permission.dto";
import { NewRolePermissionDTO } from "./dtos/new-role-permission.dto";
import { RolePermission } from "./entities/role-permission.entity";
import { RolePermissionsService } from "./services/role-permissions.service";

@ApiTags('Role Permissions')
@Controller('roles/permissions')
export class RolePermissionsController {
    constructor(
        private readonly rolePermissionsService : RolePermissionsService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Permission('view-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get('all')
    public async paginateRoles(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<RolePermission, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        return await this.rolePermissionsService.paginateRolePermissions(options);
    }

    @Permission('view-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get(':id')
    public async getRole(@Param() params : any) : Promise<RolePermission> {
        return await this.rolePermissionsService.getRolePermissionById(params.id);
    }

    @Permission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Post()
    public async createRole(@Body() newRolePermissionDTO : NewRolePermissionDTO) : Promise<RolePermission> {
        return await this.rolePermissionsService.createRolePermission(newRolePermissionDTO);
    }

    @Permission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Put(':id')
    public async editRole(@Body() editRolePermissionDTO : EditRolePermissionDTO) : Promise<RolePermission> {
        return await this.rolePermissionsService.editRolePermission(editRolePermissionDTO);
    }
}