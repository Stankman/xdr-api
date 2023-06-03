import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IAvatar } from "../interfaces/avatar.interface";
import { Account } from "src/modules/account/entities/account.entity";
import { AvatarSettings } from "../entities/avatar-settings.entity";
import { AvatarCurrency } from "../entities/avatar-currency.entity";

export class AvatarSerializer extends ModelEntitySerializer implements IAvatar {
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
    currencies: AvatarCurrency[];
    account: Account;
    account_created: number;
}