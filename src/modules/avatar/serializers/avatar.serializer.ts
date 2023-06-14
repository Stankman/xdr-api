import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IAvatar } from "../interfaces/avatar.interface";
import { Account } from "src/modules/account/entities/account.entity";
import { AvatarSettings } from "../entities/avatar-settings.entity";
import { AvatarCurrency } from "../entities/avatar-currency.entity";
import { Rank } from "src/modules/rank/entities/rank.entity";
import { ShopPayment } from "src/modules/shop/entities/shop-payment.entity";
import { Exclude, Expose } from "class-transformer";

export class AvatarSerializer extends ModelEntitySerializer implements IAvatar {
    id: number;
    
    username: string;
    
    motto: string;
    
    look: string;
    
    @Exclude()
    gender: string;

    @Exclude()
    rankId: number;

    online: boolean;

    @Expose({ groups: ['avatar.ticket']})
    auth_ticket: string;

    @Expose({ groups: ['avatar.timestamps']})
    last_online: number;
    
    @Expose({ groups: ['avatar.timestamps']})
    last_login: number;
    
    @Expose({ groups: ['avatar.currencies'] })
    credits: number;
    
    @Expose({ groups: ['avatar.timestamps']})
    account_created: number;

    settings: AvatarSettings;

    currencies: AvatarCurrency[];
    
    account: Account;
    
    rank: Rank;
    
    payments: ShopPayment[];
}