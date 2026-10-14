import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Avatar } from '../../avatar/entities/avatar.entity';

@Entity({ name: 'xdr_accounts' })
@Index('UQ_xdr_accounts_email', ['email'], { unique: true })
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified?: boolean;

  @Column({ name: 'email_verified_at', type: 'datetime', nullable: true })
  emailVerifiedAt?: Date | null;

  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date | null;

  @Column({ name: 'ip_current', type: 'varchar', length: 255, nullable: true })
  ip_current: string | null;

  @Column({ name: 'ip_register', type: 'varchar', length: 255, nullable: true })
  ip_register: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at: Date;

  // Kept as non-persisted compatibility properties for unregistered legacy services.
  avatars?: Avatar[];
  activeAvatar?: Avatar;
}
