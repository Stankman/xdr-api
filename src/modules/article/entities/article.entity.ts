import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';

@Entity({ name: 'xdr_articles' })
@Index('UQ_xdr_articles_slug', ['slug'], { unique: true })
@Index('IDX_xdr_articles_publication', ['hidden', 'publishedAt'])
@Index('IDX_xdr_articles_author_account', ['authorAccountId'])
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 2048, default: '' })
  image: string;

  @Column({ type: 'varchar', length: 2048, default: '' })
  thumbnail: string;

  @Column({ name: 'author_account_id', type: 'int', nullable: true })
  authorAccountId?: number | null;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_account_id' })
  authorAccount?: Account | null;

  @Column({ type: 'boolean', default: true })
  hidden: boolean;

  @Column({ type: 'boolean', default: false })
  pinned: boolean;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

}
