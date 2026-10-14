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

export enum AccountTokenPurpose {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RECOVERY = 'password_recovery',
  REFRESH = 'refresh',
}

@Entity({ name: 'xdr_account_tokens' })
@Index('UQ_xdr_account_tokens_hash', ['tokenHash'], { unique: true })
@Index('IDX_xdr_account_tokens_account_purpose', ['accountId', 'purpose'])
@Index('IDX_xdr_account_tokens_session', ['sessionId'])
export class AccountToken {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'account_id', type: 'int' })
  accountId: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'varchar', length: 32 })
  purpose: AccountTokenPurpose;

  @Column({ name: 'token_hash', type: 'char', length: 64, select: false })
  tokenHash: string;

  @Column({ name: 'session_id', type: 'char', length: 36, nullable: true })
  sessionId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'consumed_at', type: 'datetime', nullable: true })
  consumedAt: Date | null;
}
