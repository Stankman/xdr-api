import { Injectable } from "@nestjs/common";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { DataSource } from "typeorm";
import { ModelRepository } from "../../shared/model.repository";
import { RolesPermissions } from "../entities/roles-permissions.entity";
import { RolesPermissionsSerializer, defaultRolesPermissionsGroupsForSerializing } from "../serializers/roles-permissions.serializer";

@Injectable()
export class RolesPermissionsRepository extends ModelRepository<RolesPermissions, RolesPermissionsSerializer> {
    constructor(private dataSource : DataSource) {
        super(RolesPermissions, dataSource.createEntityManager());
    }

    public async getRolesPermissions(value : any, column : string = 'id', throwsException : boolean = true, transformOptions? : any) : Promise<RolesPermissionsSerializer> {
        return this.getOneBy({[column]: value}, [], throwsException, transformOptions);
    }

    public transform(model: RolesPermissions, transformOptions : any = { groups: defaultRolesPermissionsGroupsForSerializing }): RolesPermissionsSerializer {
        return plainToInstance(RolesPermissionsSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: RolesPermissions[], transformOptions : any = { groups: defaultRolesPermissionsGroupsForSerializing }): RolesPermissionsSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}