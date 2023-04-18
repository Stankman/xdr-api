import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from "typeorm";
import { IRole } from "../interfaces/role.interface";
import { RolePermission } from "./role-permission.entity";
import { Account } from "src/modules/account/entities/account.entity";

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

    @ApiProperty()
    @ManyToMany(
      () => Account,
      account => account.roles
    )
    @JoinTable({
      name: 'accounts_roles',
      joinColumn: {
          name: 'role_id',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'account_id',
          referencedColumnName: 'id',
        },
  })
    accounts : Account[];
}