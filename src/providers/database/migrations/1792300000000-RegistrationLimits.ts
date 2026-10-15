import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  ACCOUNT_MAX_AVATARS_KEY,
  DEFAULT_ACCOUNT_MAX_AVATARS,
  DEFAULT_REGISTRATION_MAX_ACCOUNTS_PER_IP,
  REGISTRATION_MAX_ACCOUNTS_PER_IP_KEY,
} from '../../../modules/setting/registration-defaults';

export class RegistrationLimits1792300000000 implements MigrationInterface {
  name = 'RegistrationLimits1792300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO xdr_settings (\`key\`, \`value\`)
       VALUES (?, ?), (?, ?)
       ON DUPLICATE KEY UPDATE \`key\` = \`key\``,
      [
        REGISTRATION_MAX_ACCOUNTS_PER_IP_KEY,
        String(DEFAULT_REGISTRATION_MAX_ACCOUNTS_PER_IP),
        ACCOUNT_MAX_AVATARS_KEY,
        String(DEFAULT_ACCOUNT_MAX_AVATARS),
      ],
    );
    await queryRunner.query(
      'CREATE INDEX IDX_xdr_accounts_ip_register ON xdr_accounts (ip_register(45))',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IDX_xdr_accounts_ip_register ON xdr_accounts',
    );
  }
}
