import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  ADMIN_PERMISSION_GROUP,
  DEFAULT_PERMISSION_GROUP,
} from '../../../modules/permission/permission-nodes';

export class XdrPermissionGroups1792000000000 implements MigrationInterface {
  name = 'XdrPermissionGroups1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_permission_groups (
        id int UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(64) NOT NULL,
        display_name varchar(128) NOT NULL,
        weight int NOT NULL DEFAULT 0,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX UQ_xdr_permission_groups_name (name),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_permission_group_nodes (
        id int UNSIGNED NOT NULL AUTO_INCREMENT,
        group_id int UNSIGNED NOT NULL,
        node varchar(128) NOT NULL,
        value tinyint NOT NULL,
        UNIQUE INDEX UQ_xdr_permission_group_nodes_group_node (group_id, node),
        PRIMARY KEY (id),
        CONSTRAINT FK_xdr_permission_group_nodes_group FOREIGN KEY (group_id)
          REFERENCES xdr_permission_groups (id) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_account_permission_groups (
        id int UNSIGNED NOT NULL AUTO_INCREMENT,
        account_id int NOT NULL,
        group_id int UNSIGNED NOT NULL,
        expires_at datetime NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX UQ_xdr_account_permission_groups_account_group (account_id, group_id),
        INDEX IDX_xdr_account_permission_groups_group (group_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_xdr_account_permission_groups_account FOREIGN KEY (account_id)
          REFERENCES xdr_accounts (id) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT FK_xdr_account_permission_groups_group FOREIGN KEY (group_id)
          REFERENCES xdr_permission_groups (id) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(
      `INSERT INTO xdr_permission_groups (name, display_name, weight)
       VALUES (?, ?, ?), (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = name`,
      [
        DEFAULT_PERMISSION_GROUP,
        'Default',
        0,
        ADMIN_PERMISSION_GROUP,
        'Administrator',
        100,
      ],
    );
    await queryRunner.query(
      `INSERT INTO xdr_permission_group_nodes (group_id, node, value)
       SELECT id, '*', 1 FROM xdr_permission_groups WHERE name = ?
       ON DUPLICATE KEY UPDATE node = node`,
      [ADMIN_PERMISSION_GROUP],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TABLE IF EXISTS xdr_account_permission_groups',
    );
    await queryRunner.query('DROP TABLE IF EXISTS xdr_permission_group_nodes');
    await queryRunner.query('DROP TABLE IF EXISTS xdr_permission_groups');
  }
}
