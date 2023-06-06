import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { IShopPayment } from "../interfaces/shop-payment.interface";

@Entity({ name: 'xdr_shop_payments' })
export class ShopPayment implements IShopPayment {
    @PrimaryColumn()
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

    @UpdateDateColumn({ name: 'update_at' })
    updatedAt: Date;
}