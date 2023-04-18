import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinTable, ManyToMany, OneToMany, ManyToOne } from 'typeorm';
import { IAccount } from "../interfaces/account.interface";
import { Role } from 'src/modules/role/entities/role.entity';

@Entity({ name: 'accounts'})
export class Account implements IAccount {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    last_login : number;

    @Column()
    ip_current: string;
    
    @Column()
    ip_register: string;
    
    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;

    @ManyToMany(
        () => Role,
        role => role.accounts
    )
    roles : Role[]
}