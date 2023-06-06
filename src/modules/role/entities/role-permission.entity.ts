import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
import { IPermission } from "../interfaces/permission.interface";
import { Role } from "./role.entity";

@Entity({ name: 'xdr_role_permissions' })
export class RolePermission implements IPermission {
    @ApiProperty({ example: 1, description: 'The role permission ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 1, description: 'The name of the role permission'})
    @Column()
    name: string;

    @ApiProperty({ example: 1, description: 'The description of the role permission'})
    @Column()
    description: string;

    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;

    @ManyToMany(
        () => Role,
        role => role.permissions
    )
    roles : Role[];
}