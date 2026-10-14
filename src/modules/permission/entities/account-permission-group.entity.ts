import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { PermissionGroup } from './permission-group.entity';

/** A group an account holds directly. The default group is held without a row. */
@Entity({ name: 'xdr_account_permission_groups' })
@Index(
  'UQ_xdr_account_permission_groups_account_group',
  ['accountId', 'groupId'],
  {
    unique: true,
  },
)
@Index('IDX_xdr_account_permission_groups_group', ['groupId'])
export class AccountPermissionGroup {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'account_id', type: 'int' })
  accountId: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account?: Account;

  @Column({ name: 'group_id', type: 'int', unsigned: true })
  groupId: number;

  @ManyToOne(() => PermissionGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group?: PermissionGroup;

  /** UTC. Null for a permanent membership. */
  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
