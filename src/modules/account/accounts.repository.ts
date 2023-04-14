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

    transform(model: Account): AccountSerializer {
        const tranformOptions = {
          groups: defaultAccountGroupsForSerializing
        };

        return plainToInstance(AccountSerializer, instanceToPlain(model, tranformOptions), tranformOptions);
    }

    transformMany(models: Account[]): AccountSerializer[] {
        return models.map(model => this.transform(model));
    }
}