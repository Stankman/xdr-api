import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';

@Entity({ name: 'xdr_sessions' })
@Index('UQ_xdr_sessions_refresh_hash', ['refreshTokenHash'], { unique: true })
@Index('IDX_xdr_sessions_account', ['accountId'])
@Index('IDX_xdr_sessions_active', ['accountId', 'revokedAt', 'expiresAt'])
export class AccountSession {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ name: 'account_id', type: 'int' })
  accountId: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'refresh_token_hash', type: 'char', length: 64, select: false })
  refreshTokenHash: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @Column({ name: 'last_activity_at', type: 'datetime' })
  lastActivityAt: Date;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'datetime', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;
}
