import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { Avatar } from "../entities/avatar.entity";
import { IAvatarCurrency } from "../interfaces/avatar-currency.interface";
import { Exclude } from "class-transformer";

export class AvatarCurrencySerializer extends ModelEntitySerializer implements IAvatarCurrency {
    @Exclude()
    user_id: number;
    
    type: number;
    
    amount: number;
    
    avatar: Avatar;
}