import { Account } from "src/modules/account/entities/account.entity";

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
    account: Account;
}