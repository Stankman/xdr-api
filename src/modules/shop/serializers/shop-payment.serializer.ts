import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IShopPayment } from "../interfaces/shop-payment.interface";
import { Exclude } from "class-transformer";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { ShopOffer } from "../entities/shop-offer.entity";

export class ShopPaymentSerializer extends ModelEntitySerializer implements IShopPayment {
    id: number;
    orderId: string;
    payerId: string;
    status: string;
    delivered: string;
    offer: ShopOffer;
    avatar: Avatar;
    
    createdAt: Date;
    
    @Exclude()
    updatedAt: Date;
}