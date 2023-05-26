import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IAvatarSettings } from "../interfaces/avatar-settings.interface";
import { Avatar } from "./avatar.entity";

@Entity({ name: 'users_settings'})
export class AvatarSettings implements IAvatarSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    daily_respect_points: number;
    
    @Column()
    daily_pet_respect_points: number;
    
    @Column()
    respects_given: number;
    
    @Column()
    respects_received: number;
    
    @Column()
    can_trade: boolean;
    
    @Column()
    block_following: boolean;
    
    @Column()
    block_friendrequests: boolean;
    
    @Column()
    block_roominvites: boolean;
    
    @Column()
    allow_name_change: boolean;

    @JoinColumn({ name: 'user_id'})
    @OneToOne(
        () => Avatar,
        avatar => avatar.settings
    )
    avatar: Avatar;
}