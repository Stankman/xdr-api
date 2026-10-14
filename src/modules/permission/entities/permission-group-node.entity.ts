import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionGroup } from './permission-group.entity';

/** A node, `prefix.*` or `*` that a group grants (value true) or denies (false). */
@Entity({ name: 'xdr_permission_group_nodes' })
@Index('UQ_xdr_permission_group_nodes_group_node', ['groupId', 'node'], {
  unique: true,
})
export class PermissionGroupNode {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'group_id', type: 'int', unsigned: true })
  groupId: number;

  @ManyToOne(() => PermissionGroup, (group) => group.nodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group?: PermissionGroup;

  @Column({ type: 'varchar', length: 128 })
  node: string;

  @Column({ type: 'boolean' })
  value: boolean;
}
