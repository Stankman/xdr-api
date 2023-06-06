import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { ShopOffer } from "../entities/shop-offer.entity";
import { ShopOfferSerializer } from "../serializers/shop-offer.serializer";
import { DataSource } from "typeorm";

@Injectable()
export class ShopOffersRepository extends ModelRepository<ShopOffer, ShopOfferSerializer> {
    constructor(dataSource : DataSource) {
        super(ShopOffer, dataSource.createEntityManager());
    }

    public async getOffer(value : any, column : string = 'id', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<ShopOfferSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }
}