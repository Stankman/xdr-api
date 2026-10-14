import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IAvatar } from "../interfaces/avatar.interface";
import { Account } from "src/modules/account/entities/account.entity";
import { AvatarSettings } from "./avatar-settings.entity";
import { AvatarCurrency } from "./avatar-currency.entity";
import { Rank } from "src/modules/rank/entities/rank.entity";
import { ShopPayment } from "src/modules/shop/entities/shop-payment.entity";
import { BooleanEnum } from "src/common/models/boolean.model";
import { BooleanTransformer } from "src/common/transformers/boolean.transformer";

@Entity({ name: 'users'})
export class Avatar implements IAvatar {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @ManyToOne(() => Account, account => account.avatars)
    @JoinColumn({ name: 'account_id'})
    account: Account;
    
    @Column()
    motto: string;
    
    @Column()
    look: string;
    
    @Column()
    gender: string;

    @Column()
    credits: number;

    @OneToMany(() => AvatarCurrency, currency => currency.avatar)
    currencies: AvatarCurrency[];
    
    @Column({ name: "rank" })
    rankId: number;

    @ManyToOne(() => Rank, rank => rank.avatars)
    @JoinColumn({ name: 'rank' })
    rank: Rank
    
    @Column({type: 'enum', enum: BooleanEnum, transformer: new BooleanTransformer()})
    online: boolean;
    
    @Column({name: 'auth_ticket'})
    authTicket: string;
    
    @Column({name: 'last_online'})
    lastOnline: number;

    @Column({name: 'last_login'})
    lastLogin: number;

    @CreateDateColumn()
    account_created: number;

    @OneToOne(() => AvatarSettings, avatarSettings => avatarSettings.avatar)
    settings: AvatarSettings;

    @OneToMany(() => ShopPayment,payment => payment.avatar)
    payments: ShopPayment[];
}