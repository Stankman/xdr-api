import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ModelRepository } from "../shared/model.repository";
import { Account } from "./entities/account.entity";
import { AccountSerializer } from "./serializers/account.serializer";

@Injectable()
export class AccountsRepository extends ModelRepository<Account, AccountSerializer> {
    constructor(private dataSource : DataSource) {
        super(Account, dataSource.createEntityManager());
    }
}