import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IAccount } from "../interfaces/account.interface";

@Entity({ name: 'accounts'})
export class Account implements IAccount {
    
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    ip_current: string;
    
    @Column()
    ip_register: string;
    
    @CreateDateColumn({ type: 'timestamp' })
    created_at?: Date;
    
    @UpdateDateColumn()
    updated_at: Date;
}