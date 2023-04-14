import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ModelRepository } from "../shared/model.repository";
import { Account } from "./entities/account.entity";
import { AccountSerializer, defaultAccountGroupsForSerializing } from './serializers/account.serializer';
import { instanceToPlain, plainToInstance } from "class-transformer";

@Injectable()
export class AccountsRepository extends ModelRepository<Account, AccountSerializer> {
    constructor(private dataSource : DataSource) {
        super(Account, dataSource.createEntityManager());
    }

    public async getAccount(value : any, column : string = 'id', throwsException : boolean = true) : Promise<AccountSerializer> {
        return this.getOneBy({[column]: value}, [], throwsException);
    }

    public transform(model: Account): AccountSerializer {
        const tranformOptions = {
          groups: defaultAccountGroupsForSerializing
        };

        return plainToInstance(AccountSerializer, instanceToPlain(model, tranformOptions), tranformOptions);
    }

    public transformMany(models: Account[]): AccountSerializer[] {
        return models.map(model => this.transform(model));
    }
}