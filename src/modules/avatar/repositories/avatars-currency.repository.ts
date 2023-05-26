import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { DataSource } from "typeorm";
import { AvatarCurrency } from "../entities/avatar-currency.entity";
import { AvatarCurrencySerializer } from "../serializers/avatar-currency.serializer";

@Injectable()
export class AvatarsCurrencyRepository extends ModelRepository<AvatarCurrency, AvatarCurrencySerializer> {
    constructor(private dataSource : DataSource) {
        super(AvatarCurrency, dataSource.createEntityManager());
    }
}