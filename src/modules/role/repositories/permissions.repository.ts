import { Injectable } from "@nestjs/common";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { DataSource } from "typeorm";
import { ModelRepository } from "../../shared/model.repository";
import { Permission } from "../entities/permission.entity";
import { PermissionSerializer, defaultPermissionGroupsForSerializing } from "../serializers/permission.serializer";

@Injectable()
export class PermissionsRepository extends ModelRepository<Permission, PermissionSerializer> {
    constructor(private dataSource : DataSource) {
        super(Permission, dataSource.createEntityManager());
    }

    public async getPermission(value : any, column : string = 'name', throwsException : boolean = true, transformOptions? : any) : Promise<PermissionSerializer> {
        return this.getOneBy({[column]: value}, [], throwsException, transformOptions);
    }

    public transform(model: Permission, transformOptions : any = { groups: defaultPermissionGroupsForSerializing }): PermissionSerializer {
        return plainToInstance(PermissionSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: Permission[], transformOptions : any = { groups: defaultPermissionGroupsForSerializing }): PermissionSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}