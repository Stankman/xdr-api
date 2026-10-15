import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionGroupNode } from './permission-group-node.entity';
import { PermissionGroupParent } from './permission-group-parent.entity';

@Entity({ name: 'xdr_permission_groups' })
@Index('UQ_xdr_permission_groups_name', ['name'], { unique: true })
export class PermissionGroup {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName: string;

  /** Higher wins when two groups an account holds disagree. */
  @Column({ type: 'int', default: 0 })
  weight: number;

  @OneToMany(() => PermissionGroupNode, (node) => node.group)
  nodes?: PermissionGroupNode[];

  @OneToMany(() => PermissionGroupParent, (parent) => parent.childGroup)
  parents?: PermissionGroupParent[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
