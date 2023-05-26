import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinTable, JoinColumn, ManyToMany } from "typeorm";
import { IRolesPermissions } from "../interfaces/roles-permissions.interface";
import { Role } from "./role.entity";
import { RolePermission } from "./role-permission.entity";

@Entity({ name: 'xdr_roles_permissions' })
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

    @ManyToMany(
        () => Role
    )
    @JoinColumn([{
        name: 'role_id',
        referencedColumnName: 'id'
    }])
    roles : Role[];

    @ManyToOne(
        () => RolePermission
    )
    @JoinColumn([{
        name: 'permission_id',
        referencedColumnName: 'id'
    }])
    permissions : RolePermission[];
}