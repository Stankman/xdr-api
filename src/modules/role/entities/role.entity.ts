import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { IRole } from "../interfaces/role.interface";
import { RolePermission } from "./role-permission.entity";

@Entity({ name: 'roles' })
export class Role implements IRole {
    @ApiProperty({ example: 1, description: 'The role ID' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 1, description: 'The name of the role'})
    @Column()
    name: string;

    @ApiProperty({ example: 1, description: 'The description of the role'})
    @Column()
    description: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at: Date;
    
    @ApiProperty()
    @UpdateDateColumn()
    updated_at: Date;

    @ApiProperty()
    @ManyToMany(
      () => RolePermission,
      permission => permission.roles
    )
    @JoinTable({ 
        name: 'roles_permissions',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
          },
          inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id',
          },
    })
    permissions : RolePermission[];
}