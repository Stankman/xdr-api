import { IShopOffer } from '../interfaces/shop-offer.interface';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ShopPayment } from './shop-payment.entity';

@Entity({ name: 'xdr_shop_offers' })
export class ShopOffer implements IShopOffer {
    @PrimaryColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    image: string;

    @Column()
    price: string;

    @Column()
    currency: string;

    @Column()
    data: string;

    @OneToMany(
        () => ShopPayment,
        payment => payment.offer
    )
    purchases: ShopPayment[];
}