import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  ADMIN_PERMISSION_GROUP,
  XdrPermissionNodes,
} from '../../../modules/permission/permission-nodes';

export class XdrPermissionGroupInheritance1792100000000 implements MigrationInterface {
  name = 'XdrPermissionGroupInheritance1792100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_permission_group_parents (
        id int UNSIGNED NOT NULL AUTO_INCREMENT,
        child_group_id int UNSIGNED NOT NULL,
        parent_group_id int UNSIGNED NOT NULL,
        UNIQUE INDEX UQ_xdr_permission_group_parents_child_parent
          (child_group_id, parent_group_id),
        INDEX IDX_xdr_permission_group_parents_parent (parent_group_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_xdr_permission_group_parents_child FOREIGN KEY (child_group_id)
          REFERENCES xdr_permission_groups (id) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT FK_xdr_permission_group_parents_parent FOREIGN KEY (parent_group_id)
          REFERENCES xdr_permission_groups (id) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(
      `INSERT INTO xdr_permission_groups (name, display_name, weight)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = name`,
      ['content_editor', 'Content Editor', 50],
    );

    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, ?, 1 FROM xdr_permission_groups WHERE name = 'content_editor'
       ON DUPLICATE KEY UPDATE node = node`,
      [XdrPermissionNodes.ARTICLES_MANAGE],
    );

    await queryRunner.query(
      `DELETE FROM xdr_permission_group_nodes
       WHERE group_id = (SELECT id FROM xdr_permission_groups WHERE name = ?)
         AND node = '*'`,
      [ADMIN_PERMISSION_GROUP],
    );

    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, ?, 1 FROM xdr_permission_groups WHERE name = ?
       ON DUPLICATE KEY UPDATE node = node`,
      [XdrPermissionNodes.SETTINGS_MANAGE, ADMIN_PERMISSION_GROUP],
    );
    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, ?, 1 FROM xdr_permission_groups WHERE name = ?
       ON DUPLICATE KEY UPDATE node = node`,
      [XdrPermissionNodes.AUDIT_VIEW, ADMIN_PERMISSION_GROUP],
    );
    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, ?, 1 FROM xdr_permission_groups WHERE name = ?
       ON DUPLICATE KEY UPDATE node = node`,
      [XdrPermissionNodes.ACCOUNT_SESSIONS_VIEW, ADMIN_PERMISSION_GROUP],
    );
    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, ?, 1 FROM xdr_permission_groups WHERE name = ?
       ON DUPLICATE KEY UPDATE node = node`,
      [XdrPermissionNodes.ACCOUNT_SESSIONS_MANAGE, ADMIN_PERMISSION_GROUP],
    );
    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, ?, 1 FROM xdr_permission_groups WHERE name = ?
       ON DUPLICATE KEY UPDATE node = node`,
      [XdrPermissionNodes.PERMISSIONS_MANAGE, ADMIN_PERMISSION_GROUP],
    );

    await queryRunner.query(
      `INSERT INTO xdr_permission_group_parents (child_group_id, parent_group_id)
       SELECT child.id, parent.id
       FROM xdr_permission_groups child
       CROSS JOIN xdr_permission_groups parent
       WHERE child.name = ? AND parent.name = ?
       ON DUPLICATE KEY UPDATE child_group_id = child_group_id`,
      [ADMIN_PERMISSION_GROUP, 'content_editor'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS xdr_permission_group_parents',
    );
    // Preserve role assignments and additive grants made after the migration.
    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, '*', 1 FROM xdr_permission_groups WHERE name = ?
       ON DUPLICATE KEY UPDATE node = node`,
      [ADMIN_PERMISSION_GROUP],
    );
  }
}
