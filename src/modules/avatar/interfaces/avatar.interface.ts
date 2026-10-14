import { Account } from "src/modules/account/entities/account.entity";
import { Rank } from "src/modules/rank/entities/rank.entity";
import { ShopPayment } from "src/modules/shop/entities/shop-payment.entity";
import { AvatarCurrency } from "../entities/avatar-currency.entity";
import { AvatarSettings } from "../entities/avatar-settings.entity";

export interface IAvatar {
    id: number;
    username: string;
    account: Account;
    motto: string;
    look: string;
    gender: string;
    credits: number;
    currencies : AvatarCurrency[];
    rankId: number;
    rank: Rank;
    online: boolean;
    authTicket: string;
    lastOnline: number;
    lastLogin: number;
    account_created: number;
    settings: AvatarSettings;
    payments: ShopPayment[];
}