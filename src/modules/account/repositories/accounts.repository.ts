import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ModelRepository } from "../../shared/model.repository";
import { Account } from "../entities/account.entity";
import { AccountSerializer, defaultAccountGroupsForSerializing } from '../serializers/account.serializer';
import { ClassTransformOptions, instanceToPlain, plainToInstance } from "class-transformer";

@Injectable()
export class AccountsRepository extends ModelRepository<Account, AccountSerializer> {
    constructor(private dataSource : DataSource) {
        super(Account, dataSource.createEntityManager());
    }

    public async getAccount(value : any, column : string = 'id', relations : string[] = [], throwsException : boolean = true, transformOptions? : ClassTransformOptions) : Promise<AccountSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }

    public transform(model: Account, transformOptions : ClassTransformOptions = {}): AccountSerializer {
        return plainToInstance(AccountSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: Account[], transformOptions : ClassTransformOptions = {}): AccountSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}