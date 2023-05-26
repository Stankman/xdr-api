import { Avatar } from "../entities/avatar.entity";

export interface IAvatarCurrency {
    avatar : Avatar;
    user_id: number;
    type: number;
    amount: number;
}