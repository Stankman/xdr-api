import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IAvatar } from "../interfaces/avatar.interface";
import { Account } from "src/modules/account/entities/account.entity";
import { AvatarSettings } from "../entities/avatar-settings.entity";
import { AvatarCurrency } from "../entities/avatar-currency.entity";
import { Rank } from "src/modules/rank/entities/rank.entity";
import { ShopPayment } from "src/modules/shop/entities/shop-payment.entity";
import { Exclude, Expose, Type } from "class-transformer";
import { RankSerializer } from "src/modules/rank/serializers/rank.serializer";
import { ShopPaymentSerializer } from "src/modules/shop/serializers/shop-payment.serializer";
import { AccountSerializer } from "src/modules/account/serializers/account.serializer";
import { AvatarSettingsSerializer } from "./avatar-settings.serializer";
import { AvatarCurrencySerializer } from "./avatar-currency.serializer";

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

    @Expose({groups: ['avatar.ticket']})
    auth_ticket: string;

    @Expose({groups: ['avatar.timestamps']})
    last_online: number;
    
    @Expose({groups: ['avatar.timestamps']})
    last_login: number;
    
    @Expose({groups: ['avatar.currencies']})
    credits: number;
    
    @Expose({groups: ['avatar.timestamps']})
    account_created: number;

    @Type(() => AvatarSettingsSerializer)
    settings: AvatarSettings;

    @Expose({groups: ['avatar.currencies']})
    @Type(() => AvatarCurrencySerializer)
    currencies: AvatarCurrency[];
    
    @Type(() => AccountSerializer)
    account: Account;
    
    @Type(() => RankSerializer)
    rank: Rank;
    
    @Type(() => ShopPaymentSerializer)
    payments: ShopPayment[];
}