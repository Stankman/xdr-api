import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Avatar } from "./avatar.entity";
import { IAvatarCurrency } from "../interfaces/avatar-currency.interface";

@Entity({ name: 'users_currency' })
export class AvatarCurrency implements IAvatarCurrency {
    @PrimaryColumn()
    user_id: number;
    
    @PrimaryColumn()
    type: number;

    @Column()
    amount: number;

    @ManyToOne(
        () => Avatar,
        avatar => avatar.currencies
    )
    @JoinColumn({ name: 'user_id' })
    avatar: Avatar;
}