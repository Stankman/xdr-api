import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IAvatar } from "../interfaces/avatar.interface";
import { Account } from "src/modules/account/entities/account.entity";
import { AvatarSettings } from "./avatar-settings.entity";
import { AvatarCurrency } from "./avatar-currency.entity";

@Entity({ name: 'users'})
export class Avatar implements IAvatar {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;
    
    @Column()
    motto: string;
    
    @Column()
    look: string;
    
    @Column()
    gender: string;
    
    @Column()
    rank: number;
    
    @Column()
    online: boolean;
    
    @Column()
    auth_ticket: string;
    
    @Column()
    last_online: number;

    @OneToOne(
        () => AvatarSettings,
        avatarSettings => avatarSettings.avatar
    )
    settings: AvatarSettings;

    @ManyToOne(
        () => Account,
        account => account.avatars
    )
    @JoinColumn({ name: 'account_id'})
    account: Account;

    @OneToMany(
        () => AvatarCurrency,
        currency => currency.avatar
    )
    currencies: AvatarCurrency[];
}