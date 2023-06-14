import { Injectable } from "@nestjs/common";
import { plainToInstance, instanceToPlain, ClassTransformOptions } from "class-transformer";
import { DataSource } from "typeorm";
import { ModelRepository } from "../../shared/model.repository";
import { Role } from "../entities/role.entity";
import { RoleSerializer, defaultRoleGroupsForSerializing } from "../serializers/role.serializer";

@Injectable()
export class RolesRepository extends ModelRepository<Role, RoleSerializer> {
    constructor(private dataSource : DataSource) {
        super(Role, dataSource.createEntityManager());
    }

    public async getRole(value : any, column : string = 'id', relations : string[] = [], throwsException : boolean = true, transformOptions? : ClassTransformOptions) : Promise<RoleSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }

    public transform(model: Role, transformOptions : ClassTransformOptions = {}): RoleSerializer {
        return plainToInstance(RoleSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: Role[], transformOptions : ClassTransformOptions = {}): RoleSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}