import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ModelRepository } from "../../shared/model.repository";
import { AccountsRoles } from "../entities/accounts-roles.entity";
import { AccountsRolesSerializer } from "../serializers/accounts-roles.serializer";

@Injectable()
export class AccountsRolesRepository extends ModelRepository<AccountsRoles, AccountsRolesSerializer> {
    constructor(private dataSource : DataSource) {
        super(AccountsRoles, dataSource.createEntityManager());
    }

    public async get(value : any, column : string = 'id', throwsException : boolean = true, transformOptions? : any) : Promise<AccountsRolesSerializer> {
        return this.getOneBy({[column]: value}, [], throwsException, transformOptions);
    }
}