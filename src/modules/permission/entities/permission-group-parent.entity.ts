import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionGroup } from './permission-group.entity';

/** A child group inherits assignments from its parent group. */
@Entity({ name: 'xdr_permission_group_parents' })
@Index(
  'UQ_xdr_permission_group_parents_child_parent',
  ['childGroupId', 'parentGroupId'],
  { unique: true },
)
@Index('IDX_xdr_permission_group_parents_parent', ['parentGroupId'])
export class PermissionGroupParent {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'child_group_id', type: 'int', unsigned: true })
  childGroupId: number;

  @ManyToOne(() => PermissionGroup, (group) => group.parents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'child_group_id' })
  childGroup?: PermissionGroup;

  @Column({ name: 'parent_group_id', type: 'int', unsigned: true })
  parentGroupId: number;

  @ManyToOne(() => PermissionGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_group_id' })
  parentGroup?: PermissionGroup;
}
