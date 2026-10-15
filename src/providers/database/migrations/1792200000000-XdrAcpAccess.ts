import { MigrationInterface, QueryRunner } from 'typeorm';
import { XdrPermissionNodes } from '../../../modules/permission/permission-nodes';

export class XdrAcpAccess1792200000000 implements MigrationInterface {
  name = 'XdrAcpAccess1792200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, ?, 1 FROM xdr_permission_groups WHERE name IN ('admin', 'content_editor')
       ON DUPLICATE KEY UPDATE node = node`,
      [XdrPermissionNodes.ACP_ACCESS],
    );
  }

  async down(): Promise<void> {
    // Keep the additive grant: it may have been customized after deployment.
  }
}
