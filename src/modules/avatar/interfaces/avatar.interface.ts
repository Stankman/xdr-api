import { Account } from "src/modules/account/entities/account.entity";
import { AvatarSettings } from "../entities/avatar-settings.entity";
import { AvatarCurrency } from "../entities/avatar-currency.entity";

export interface IAvatar {
    id: number;
    username: string;
    motto: string;
    look: string;
    gender: string;
    rank: number;
    online: boolean;
    auth_ticket: string;
    last_online: number;
    last_login: number;
    settings: AvatarSettings;
    credits: number;
    currencies : AvatarCurrency[];
    account: Account;
    account_created: number;
}