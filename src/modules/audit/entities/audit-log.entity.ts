import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'xdr_audit_logs' })
@Index('IDX_xdr_audit_actor_created', ['actorAccountId', 'createdAt'])
@Index('IDX_xdr_audit_target_created', ['targetType', 'targetId', 'createdAt'])
@Index('IDX_xdr_audit_request_id', ['requestId'])
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'actor_account_id', type: 'int', nullable: true })
  actorAccountId: number | null;

  @Column({ name: 'actor_player_id', type: 'int', nullable: true })
  actorPlayerId: number | null;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'target_type', type: 'varchar', length: 80 })
  targetType: string;

  @Column({ name: 'target_id', type: 'varchar', length: 128, nullable: true })
  targetId: string | null;

  @Column({ type: 'varchar', length: 16 })
  result: 'success' | 'failure';

  @Column({ name: 'request_id', type: 'varchar', length: 128 })
  requestId: string;

  @Column({ type: 'json', nullable: true })
  details: Record<string, string | number | boolean | null> | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
