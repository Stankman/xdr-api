import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { ShopPayment } from "../entities/shop-payment.entity";
import { ShopPaymentSerializer } from "../serializers/shop-payment.serializer";
import { DataSource } from "typeorm";

@Injectable()
export class ShopPaymentsRepository extends ModelRepository<ShopPayment, ShopPaymentSerializer> {
    constructor(dataSource : DataSource) {
        super(ShopPayment, dataSource.createEntityManager());
    }

    public async getPayment(value : any, column : string = 'id', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<ShopPaymentSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }
}