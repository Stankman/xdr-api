import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { IRolesPermissions } from "../interfaces/roles-permissions.interface";

@Entity({ name: 'roles_permissions' })
export class RolesPermissions implements IRolesPermissions {
    @ApiProperty({ example: 1, description: 'The roles permissions ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 1, description: 'The role ID'})
    @Column()
    role_id: number;

    @ApiProperty({ example: 1, description: 'The permission ID'})
    @Column()
    permission_id: number;

    @CreateDateColumn()
    created_at: Date;
}