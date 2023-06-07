import { ShopPayment } from "../entities/shop-payment.entity";

export interface IShopOffer {
    id: number;
    title: string;
    description: string;
    image: string;
    price: string;
    currency: string;
    data: string;
    purchases: ShopPayment[];
}