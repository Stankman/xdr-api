import { Account } from "src/modules/account/entities/account.entity";
import { Article } from "src/modules/article/entities/article.entity";
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
    auth_ticket: string;
    last_online: number;
    last_login: number;
    account_created: number;
    settings: AvatarSettings;
    articles: Article[];
    payments: ShopPayment[];
}