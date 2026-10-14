import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ISetting } from '../interfaces/setting';

@Entity({ name: 'xdr_settings' })
export class XdrSetting implements ISetting {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt?: Date;
}
