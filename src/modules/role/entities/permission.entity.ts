import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
import { IPermission } from "../interfaces/permission.interface";
import { Role } from "./role.entity";

@Entity({ name: 'xdr_role_permissions' })
export class Permission implements IPermission {
    @ApiProperty({ example: 1, description: 'The name of the role permission'})
    @PrimaryGeneratedColumn()
    name: string;

    @ApiProperty({ example: 1, description: 'The description of the role permission'})
    @Column()
    description: string;

    @ManyToMany(() => Role, role => role.permissions)
    roles : Role[];
}