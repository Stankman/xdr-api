import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { ShopOffer } from "../entities/shop-offer.entity";

export interface IShopPayment {
    id: number;
    orderId: string;
    payerId: string;
    status: string;
    delivered: string;
    createdAt: Date;
    updatedAt: Date;
    offer: ShopOffer;
    avatar: Avatar;
}