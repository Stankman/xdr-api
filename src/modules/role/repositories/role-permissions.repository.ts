import { Injectable } from "@nestjs/common";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { DataSource } from "typeorm";
import { ModelRepository } from "../../shared/model.repository";
import { RolePermission } from "../entities/role-permission.entity";
import { RolePermissionSerializer, defaultRolePermissionGroupsForSerializing } from "../serializers/role-permission.serializer";

@Injectable()
export class RolePermissionsRepository extends ModelRepository<RolePermission, RolePermissionSerializer> {
    constructor(private dataSource : DataSource) {
        super(RolePermission, dataSource.createEntityManager());
    }

    public async getRolePermission(value : any, column : string = 'id', throwsException : boolean = true, transformOptions? : any) : Promise<RolePermissionSerializer> {
        return this.getOneBy({[column]: value}, [], throwsException, transformOptions);
    }

    public transform(model: RolePermission, transformOptions : any = { groups: defaultRolePermissionGroupsForSerializing }): RolePermissionSerializer {
        return plainToInstance(RolePermissionSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: RolePermission[], transformOptions : any = { groups: defaultRolePermissionGroupsForSerializing }): RolePermissionSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}