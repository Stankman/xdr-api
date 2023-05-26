import { Avatar } from "../entities/avatar.entity";

export interface IAvatarSettings {
    id: number;
    avatar : Avatar;
    daily_respect_points: number;
    daily_pet_respect_points: number;
    respects_given: number;
    respects_received: number;
    can_trade: boolean;
    block_following: boolean;
    block_friendrequests: boolean;
    block_roominvites: boolean;
    allow_name_change: boolean;
}