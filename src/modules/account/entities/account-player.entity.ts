import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Account } from './account.entity';

@Entity({ name: 'xdr_account_players' })
@Index('UQ_xdr_account_players_player', ['playerId'], { unique: true })
@Index('IDX_xdr_account_players_account', ['accountId'])
export class AccountPlayer {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'account_id', type: 'int' })
  accountId: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'player_id', type: 'int' })
  playerId: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
