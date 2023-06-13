import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, JoinColumn, OneToOne, ManyToOne, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { IRole } from "../interfaces/role.interface";
import { Permission } from "./permission.entity";
import { BooleanEnum } from "src/common/models/boolean.model";
import { BooleanTransformer } from "src/common/transformers/boolean.transformer";
import { Rank } from "src/modules/rank/entities/rank.entity";

@Entity({ name: 'xdr_roles' })
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

  @Column({
    type: 'enum',
    enum: BooleanEnum,
    transformer: new BooleanTransformer()
  })
  hidden: boolean;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
  
  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(
    () => Rank, 
    {nullable: true}
  )
  @JoinColumn({name: 'group_id'})
  rank: Rank;

  @ApiProperty()
  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
      name: 'xdr_role_permissions',
      joinColumn: { name: 'role_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'permission_name', referencedColumnName: 'name' }
  })
  permissions : Permission[];

  @ManyToOne(
    () => Role,
    role => role.children,
    {nullable: true}
  )
  @JoinColumn({ name: 'parent_id' })
  parent: Role;

  @OneToMany(
    () => Role,
    role => role.parent
  )
  children: Role[];
}