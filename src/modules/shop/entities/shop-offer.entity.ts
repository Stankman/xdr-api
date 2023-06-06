import { IShopOffer } from '../interfaces/shop-offer.interface';
import { Entity } from 'typeorm';

@Entity({ name: 'xdr_shop_offers' })
export class ShopOffer implements IShopOffer {
    id: number;
    title: string;
    description: string;
    image: string;
    price: number;
    data: any;
}