import { Role } from "src/modules/role/entities/role.entity";
import { IAccountsRoles } from "../interfaces/accounts-roles.interface";
import { Account } from "./account.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne, ManyToMany } from "typeorm";

@Entity({ name: 'xdr_accounts_roles' })
export class AccountsRoles implements IAccountsRoles {
    @ApiProperty({ example: 1, description: 'The accounts roles ID' })
    @PrimaryGeneratedColumn()
    id: number;
    
    @ApiProperty({ example: 1, description: 'The account ID'})
    @Column()
    account_id: number;
    
    @ApiProperty({ example: 1, description: 'The role ID'})
    @Column()
    role_id: number;

    @CreateDateColumn()
    created_at: Date;

    @ManyToMany(
        () => Role
    )
    @JoinColumn([{
        name: 'role_id',
        referencedColumnName: 'id'
    }])
    roles: Role[];
    
    @ManyToMany(
        () => Account
    )
    @JoinColumn([{
        name: 'account_id',
        referencedColumnName: 'id'
    }])
    accounts: Account[];
}