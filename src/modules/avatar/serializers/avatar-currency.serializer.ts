import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { Avatar } from "../entities/avatar.entity";
import { IAvatarCurrency } from "../interfaces/avatar-currency.interface";

export class AvatarCurrencySerializer extends ModelEntitySerializer implements IAvatarCurrency {
    user_id: number;
    type: number;
    amount: number;
    avatar: Avatar;
}