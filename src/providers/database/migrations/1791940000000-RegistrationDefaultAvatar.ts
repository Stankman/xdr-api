import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  DEFAULT_REGISTRATION_AVATAR,
  REGISTRATION_DEFAULT_AVATAR_KEY,
} from '../../../modules/setting/registration-defaults';

export class RegistrationDefaultAvatar1791940000000 implements MigrationInterface {
  name = 'RegistrationDefaultAvatar1791940000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO xdr_settings (\`key\`, \`value\`)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE \`key\` = \`key\``,
      [REGISTRATION_DEFAULT_AVATAR_KEY, DEFAULT_REGISTRATION_AVATAR],
    );
  }

  public async down(): Promise<void> {
    // Preserve configuration that may have existed before this seed migration.
  }
}
