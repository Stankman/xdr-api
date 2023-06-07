import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IShopOffer } from "../interfaces/shop-offer.interface";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { ShopOffer } from "../entities/shop-offer.entity";
import { ShopPayment } from "../entities/shop-payment.entity";

export class ShopOfferSerializer extends ModelEntitySerializer implements IShopOffer {
    id: number;
    title: string;
    description: string;
    image: string;
    price: string;
    currency: string;
    data: string;
    purchases: ShopPayment[];
}