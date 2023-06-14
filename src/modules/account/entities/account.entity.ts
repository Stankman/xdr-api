import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { IAccount } from "../interfaces/account.interface";
import { Avatar } from 'src/modules/avatar/entities/avatar.entity';

@Entity({ name: 'xdr_accounts'})
export class Account implements IAccount {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ name: 'last_login'})
    lastLogin : Date;

    @Column()
    ip_current: string;
    
    @Column()
    ip_register: string;
    
    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(
        () => Avatar,
        avatar => avatar.account
    )
    avatars: Avatar[];

    @JoinColumn({ name: 'active_avatar_id'})
    @OneToOne(() => Avatar, avatar => avatar.account, { cascade: true })
    activeAvatar: Avatar;
}