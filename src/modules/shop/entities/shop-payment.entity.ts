import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IShopPayment } from "../interfaces/shop-payment.interface";
import { ShopOffer } from "./shop-offer.entity";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";

@Entity({ name: 'xdr_shop_payments' })
export class ShopPayment implements IShopPayment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_id' })
    orderId: string;

    @Column({ name: 'payer_id' })
    payerId: string;

    @Column()
    status: string;

    @Column()
    delivered: string;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(
        () => ShopOffer,
        offer => offer.purchases
    )
    @JoinColumn({ name: 'offer_id'})
    offer: ShopOffer;

    @ManyToOne(
        () => Avatar,
        avatar => avatar.payments
    )
    @JoinColumn({ name: 'avatar_id'})
    avatar: Avatar;
}