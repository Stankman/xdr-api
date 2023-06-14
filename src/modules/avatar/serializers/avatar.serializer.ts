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
import { ArticleSerializer } from "src/modules/article/serializers/article.serializer";
import { Article } from "src/modules/article/entities/article.entity";

export const defaultAvatarGroup: string[] = [
    'avatar.default'
];

export const extendCurrenciesAvatarGroup: string[] = [
    ...defaultAvatarGroup,
    'avatar.currencies'
];

export const extendTimestampsAvatarGroup: string[] = [
    'avatar.timestamps'
];

export const extendCompleteAvatarGroup: string[] = [
    ...extendCurrenciesAvatarGroup,
    ...extendTimestampsAvatarGroup
];

export const extendRankAvatarGroup: string[] = [
    ...defaultAvatarGroup,
    'avatar.rank'
];

export class AvatarSerializer extends ModelEntitySerializer implements IAvatar {
    id: number;
    
    @Expose({groups: ['avatar.default']})
    username: string;

    @Type(() => AccountSerializer)
    account: Account;
    
    @Expose({groups: ['avatar.default']})
    motto: string;
    
    @Expose({groups: ['avatar.default']})
    look: string;
    
    @Exclude()
    gender: string;

    @Expose({groups: ['avatar.currencies']})
    credits: number;

    @Expose({groups: ['avatar.currencies']})
    @Type(() => AvatarCurrencySerializer)
    currencies: AvatarCurrency[];

    @Exclude()
    rankId: number;

    @Expose({groups: ['avatar.rank']})
    @Type(() => RankSerializer)
    rank: Rank;

    @Expose({groups: ['avatar.default']})
    online: boolean;

    @Expose({groups: ['avatar.ticket']})
    authTicket: string;

    @Expose({groups: ['avatar.timestamps']})
    lastOnline: number;
    
    @Expose({groups: ['avatar.timestamps']})
    lastLogin: number;
    
    @Expose({groups: ['avatar.timestamps']})
    account_created: number;

    @Type(() => AvatarSettingsSerializer)
    settings: AvatarSettings;

    @Type(() => ArticleSerializer)
    articles: Article[];
    
    @Type(() => ShopPaymentSerializer)
    payments: ShopPayment[];
}