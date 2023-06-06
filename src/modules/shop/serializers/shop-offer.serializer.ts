import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IShopOffer } from "../interfaces/shop-offer.interface";

export class ShopOfferSerializer extends ModelEntitySerializer implements IShopOffer {
    id: number;
    title: string;
    description: string;
    image: string;
    price: number;
    data: any;
}