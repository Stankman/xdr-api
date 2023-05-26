import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IAvatarSettings } from "../interfaces/avatar-settings.interface";
import { Avatar } from "../entities/avatar.entity";

export class AvatarSettingsSerializer extends ModelEntitySerializer implements IAvatarSettings {
    id: number;
    avatar: Avatar;
    respects_given: number;
    respects_received: number;
    can_trade: boolean;
    block_following: boolean;
    block_friendrequests: boolean;
    block_roominvites: boolean;
    allow_name_change: boolean;
}