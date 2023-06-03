import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IAvatar } from "../interfaces/avatar.interface";
import { Account } from "src/modules/account/entities/account.entity";
import { AvatarSettings } from "./avatar-settings.entity";
import { AvatarCurrency } from "./avatar-currency.entity";
import { Rank } from "src/modules/rank/entities/rank.entity";

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
    
    @Column({ name: "rank" })
    rankId: number;
    
    @Column()
    online: boolean;
    
    @Column()
    auth_ticket: string;
    
    @Column()
    last_online: number;

    @Column()
    last_login: number;

    @Column()
    credits: number;

    @OneToOne(
        () => AvatarSettings,
        avatarSettings => avatarSettings.avatar,
        { cascade: true }
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
        currency => currency.avatar,
        { cascade: true }
    )
    currencies: AvatarCurrency[];

    @ManyToOne(
        () => Rank,
        rank => rank.avatars
    )
    @JoinColumn({ name: 'rank' })
    rank: Rank

    

    @CreateDateColumn()
    account_created: number;
}