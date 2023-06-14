import { Controller, UseGuards, Get, Query, DefaultValuePipe, ParseIntPipe, Param, Post, Body, Put } from "@nestjs/common";
import { AuthGuard } from "src/common/guards/auth.guard";
import { ApiTags } from "@nestjs/swagger";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AppConfigService } from "src/config/app/app-config.service";
import { PermissionDTO } from "../dtos/permission.dto";
import { PermissionService } from "../services/permission.service";
import { RolePermission } from "src/common/decorators/role-permission.decorator";
import { Permission } from "../entities/permission.entity";
import { NewPermissionDTO } from "../dtos/new-permission.dto";

@ApiTags('Permissions')
@Controller('roles/permissions')
export class PermissionsController {
    constructor(
        private readonly permissionService : PermissionService,
        private readonly appConfigService : AppConfigService
    ) {}

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get('all')
    public async paginatePermissions(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Permission, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        return await this.permissionService.paginatePermissions(options);
    }

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get(':name')
    public async getPermission(@Param() params : any) : Promise<Permission> {
        return await this.permissionService.getPermissionByName(params.name);
    }

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)
    @Post()
    public async createPermission(@Body() newPermissionDTO : NewPermissionDTO) : Promise<Permission> {
        return await this.permissionService.createPermission(newPermissionDTO);
    }

    @RolePermission('manage-roles')
    @UseGuards(AuthGuard, RolesGuard)    
    @Put()
    public async updatePermission(@Body() PermissionDTO : PermissionDTO) : Promise<Permission> {
        return await this.permissionService.editPermission(PermissionDTO);
    }
}