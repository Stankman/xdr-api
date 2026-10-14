import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class XdrApiFoundation1770000000000 implements MigrationInterface {
  name = 'XdrApiFoundation1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_accounts (
        id int NOT NULL AUTO_INCREMENT,
        email varchar(254) NOT NULL,
        password varchar(255) NOT NULL,
        last_login datetime NULL,
        ip_current varchar(255) NULL,
        ip_register varchar(255) NULL,
        email_verified tinyint(1) NOT NULL DEFAULT 0,
        email_verified_at datetime NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
    if (!(await this.hasSingleColumnIndex(queryRunner, 'xdr_sessions', 'refresh_token_hash', true))) {
      const duplicateRefreshHashes = await queryRunner.query(`
        SELECT refresh_token_hash
        FROM xdr_sessions
        GROUP BY refresh_token_hash
        HAVING COUNT(*) > 1
        LIMIT 1
      `);
      if (duplicateRefreshHashes.length > 0) {
        throw new Error('Cannot create the unique XDR refresh-token index: duplicate hashes exist.');
      }
      await queryRunner.createIndex(
        'xdr_sessions',
        new TableIndex({
          name: 'UQ_xdr_sessions_refresh_hash',
          columnNames: ['refresh_token_hash'],
          isUnique: true,
        }),
      );
    }
    await this.addColumnIfMissing(
      queryRunner,
      'xdr_accounts',
      new TableColumn({
        name: 'email_verified',
        type: 'tinyint',
        width: 1,
        isNullable: false,
        default: 0,
      }),
    );
    await this.addColumnIfMissing(
      queryRunner,
      'xdr_accounts',
      new TableColumn({ name: 'email_verified_at', type: 'datetime', isNullable: true }),
    );
    await this.addColumnIfMissing(
      queryRunner,
      'xdr_accounts',
      new TableColumn({
        name: 'ip_current',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await this.addColumnIfMissing(
      queryRunner,
      'xdr_accounts',
      new TableColumn({
        name: 'ip_register',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    const duplicateEmails = await queryRunner.query(`
      SELECT LOWER(TRIM(email)) AS normalized_email, COUNT(*) AS count
      FROM xdr_accounts
      GROUP BY LOWER(TRIM(email))
      HAVING COUNT(*) > 1
      LIMIT 1
    `);
    if (duplicateEmails.length > 0) {
      throw new Error(
        'Cannot create the unique XDR account email index: duplicate case-insensitive emails exist.',
      );
    }
    await queryRunner.query('UPDATE xdr_accounts SET email = LOWER(TRIM(email))');
    if (!(await this.hasSingleColumnIndex(queryRunner, 'xdr_accounts', 'email', true))) {
      await queryRunner.createIndex(
        'xdr_accounts',
        new TableIndex({
          name: 'UQ_xdr_accounts_email',
          columnNames: ['email'],
          isUnique: true,
        }),
      );
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_articles (
        id int NOT NULL AUTO_INCREMENT,
        title varchar(255) NOT NULL,
        slug varchar(255) NOT NULL,
        description varchar(500) NOT NULL,
        content text NOT NULL,
        image varchar(2048) NOT NULL DEFAULT '',
        thumbnail varchar(2048) NOT NULL DEFAULT '',
        hidden tinyint(1) NOT NULL DEFAULT 1,
        pinned tinyint(1) NOT NULL DEFAULT 0,
        published_at datetime NULL,
        author_account_id int NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
    await this.addColumnIfMissing(
      queryRunner,
      'xdr_articles',
      new TableColumn({ name: 'published_at', type: 'datetime', isNullable: true }),
    );
    await this.addColumnIfMissing(
      queryRunner,
      'xdr_articles',
      new TableColumn({
        name: 'author_account_id',
        type: 'int',
        isNullable: true,
      }),
    );
    await queryRunner.query(`
      UPDATE xdr_articles
      SET description = COALESCE(description, ''),
          content = COALESCE(content, ''),
          image = COALESCE(image, ''),
          thumbnail = COALESCE(thumbnail, ''),
          hidden = COALESCE(hidden, 1),
          pinned = COALESCE(pinned, 0)
    `);
    await queryRunner.query(`
      ALTER TABLE xdr_articles
        MODIFY description varchar(500) NOT NULL,
        MODIFY content TEXT NOT NULL,
        MODIFY image varchar(2048) NOT NULL DEFAULT '',
        MODIFY thumbnail varchar(2048) NOT NULL DEFAULT '',
        MODIFY hidden tinyint(1) NOT NULL DEFAULT 1,
        MODIFY pinned tinyint(1) NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      UPDATE xdr_articles
      SET published_at = created_at
      WHERE hidden = 0 AND published_at IS NULL
    `);
    if (!(await this.hasIndex(queryRunner, 'xdr_articles', 'IDX_xdr_articles_publication'))) {
      await queryRunner.createIndex(
        'xdr_articles',
        new TableIndex({
          name: 'IDX_xdr_articles_publication',
          columnNames: ['hidden', 'published_at'],
        }),
      );
    }
    if (!(await this.hasIndex(queryRunner, 'xdr_articles', 'IDX_xdr_articles_author_account'))) {
      await queryRunner.createIndex(
        'xdr_articles',
        new TableIndex({
          name: 'IDX_xdr_articles_author_account',
          columnNames: ['author_account_id'],
        }),
      );
    }
    const articles = (await queryRunner.query(
      'SELECT id, slug FROM xdr_articles ORDER BY id ASC',
    )) as Array<{ id: number; slug: string | null }>;
    const usedSlugs = new Set<string>();
    for (const article of articles) {
      const base =
        (article.slug ?? '')
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 220) || `article-${article.id}`;
      let slug = base;
      let suffix = 1;
      while (usedSlugs.has(slug)) {
        suffix += 1;
        slug = `${base}-${suffix}`;
      }
      usedSlugs.add(slug);
      if (slug !== article.slug) {
        await queryRunner.query('UPDATE xdr_articles SET slug = ? WHERE id = ?', [
          slug,
          article.id,
        ]);
      }
    }
    if (!(await this.hasSingleColumnIndex(queryRunner, 'xdr_articles', 'slug', true))) {
      await queryRunner.createIndex(
        'xdr_articles',
        new TableIndex({
          name: 'UQ_xdr_articles_slug',
          columnNames: ['slug'],
          isUnique: true,
        }),
      );
    }
    const articleTable = await queryRunner.getTable('xdr_articles');
    if (
      articleTable &&
      !articleTable.foreignKeys.some((key) => key.columnNames.includes('author_account_id'))
    ) {
      await queryRunner.createForeignKey(
        'xdr_articles',
        new TableForeignKey({
          name: 'FK_xdr_articles_author_account',
          columnNames: ['author_account_id'],
          referencedTableName: 'xdr_accounts',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_settings (
        \`key\` varchar(255) NOT NULL,
        value text NOT NULL,
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`key\`)
      ) ENGINE=InnoDB
    `);
    await this.addColumnIfMissing(
      queryRunner,
      'xdr_settings',
      new TableColumn({
        name: 'updated_at',
        type: 'datetime',
        isNullable: false,
        default: () => 'CURRENT_TIMESTAMP',
      }),
    );
    await queryRunner.query(`
      ALTER TABLE xdr_settings
        MODIFY value TEXT NOT NULL,
        MODIFY updated_at datetime(6) NOT NULL
          DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_sessions (
        id char(36) NOT NULL,
        account_id int NOT NULL,
        refresh_token_hash char(64) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        last_activity_at datetime NOT NULL,
        expires_at datetime NOT NULL,
        revoked_at datetime NULL,
        ip_address varchar(45) NULL,
        user_agent varchar(512) NULL,
        PRIMARY KEY (id),
        KEY IDX_xdr_sessions_account (account_id),
        KEY IDX_xdr_sessions_active (account_id, revoked_at, expires_at),
        UNIQUE KEY UQ_xdr_sessions_refresh_hash (refresh_token_hash),
        CONSTRAINT FK_xdr_sessions_account FOREIGN KEY (account_id)
          REFERENCES xdr_accounts (id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_account_tokens (
        id int unsigned NOT NULL AUTO_INCREMENT,
        account_id int NOT NULL,
        purpose varchar(32) NOT NULL,
        token_hash char(64) NOT NULL,
        session_id char(36) NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        expires_at datetime NOT NULL,
        consumed_at datetime NULL,
        PRIMARY KEY (id),
        UNIQUE KEY UQ_xdr_account_tokens_hash (token_hash),
        KEY IDX_xdr_account_tokens_account_purpose (account_id, purpose),
        KEY IDX_xdr_account_tokens_session (session_id),
        CONSTRAINT FK_xdr_account_tokens_account FOREIGN KEY (account_id)
          REFERENCES xdr_accounts (id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_account_players (
        id int unsigned NOT NULL AUTO_INCREMENT,
        account_id int NOT NULL,
        player_id int NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_xdr_account_players_player (player_id),
        KEY IDX_xdr_account_players_account (account_id),
        CONSTRAINT FK_xdr_account_players_account FOREIGN KEY (account_id)
          REFERENCES xdr_accounts (id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS xdr_audit_logs (
        id bigint unsigned NOT NULL AUTO_INCREMENT,
        actor_account_id int NULL,
        actor_player_id int NULL,
        action varchar(100) NOT NULL,
        target_type varchar(80) NOT NULL,
        target_id varchar(128) NULL,
        result varchar(16) NOT NULL,
        request_id varchar(128) NOT NULL,
        details json NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY IDX_xdr_audit_actor_created (actor_account_id, created_at),
        KEY IDX_xdr_audit_target_created (target_type, target_id, created_at),
        KEY IDX_xdr_audit_request_id (request_id)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'xdr_audit_logs',
      'xdr_account_players',
      'xdr_account_tokens',
      'xdr_sessions',
    ]) {
      if (await queryRunner.hasTable(table)) await queryRunner.dropTable(table, true);
    }
    const articleTable = await queryRunner.getTable('xdr_articles');
    if (articleTable) {
      for (const foreignKey of articleTable.foreignKeys.filter((key) =>
        key.columnNames.includes('author_account_id'),
      )) {
        await queryRunner.dropForeignKey('xdr_articles', foreignKey);
      }
      if (await this.hasIndex(queryRunner, 'xdr_articles', 'IDX_xdr_articles_author_account')) {
        await queryRunner.dropIndex('xdr_articles', 'IDX_xdr_articles_author_account');
      }
      if (await this.hasIndex(queryRunner, 'xdr_articles', 'IDX_xdr_articles_publication')) {
        await queryRunner.dropIndex('xdr_articles', 'IDX_xdr_articles_publication');
      }
      if (await this.hasIndex(queryRunner, 'xdr_articles', 'UQ_xdr_articles_slug')) {
        await queryRunner.dropIndex('xdr_articles', 'UQ_xdr_articles_slug');
      }
      if (await queryRunner.hasColumn('xdr_articles', 'author_account_id')) {
        await queryRunner.dropColumn('xdr_articles', 'author_account_id');
      }
      if (await queryRunner.hasColumn('xdr_articles', 'published_at')) {
        await queryRunner.dropColumn('xdr_articles', 'published_at');
      }
    }
    const settingsTable = await queryRunner.getTable('xdr_settings');
    if (settingsTable && settingsTable.findColumnByName('updated_at')) {
      await queryRunner.dropColumn('xdr_settings', 'updated_at');
    }
    if (await this.hasIndex(queryRunner, 'xdr_accounts', 'UQ_xdr_accounts_email')) {
      await queryRunner.dropIndex('xdr_accounts', 'UQ_xdr_accounts_email');
    }
    for (const column of ['email_verified_at', 'email_verified']) {
      if (await queryRunner.hasColumn('xdr_accounts', column)) {
        await queryRunner.dropColumn('xdr_accounts', column);
      }
    }
  }

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
    column: TableColumn,
  ): Promise<void> {
    if (!(await queryRunner.hasColumn(tableName, column.name))) {
      await queryRunner.addColumn(tableName, column);
    }
  }

  private async hasIndex(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
  ): Promise<boolean> {
    return (await queryRunner.getTable(tableName))?.indices.some((index) => index.name === indexName)
      ?? false;
  }

  private async hasSingleColumnIndex(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    unique: boolean,
  ): Promise<boolean> {
    return (
      (await queryRunner.getTable(tableName))?.indices.some(
        (index) =>
          index.isUnique === unique &&
          index.columnNames.length === 1 &&
          index.columnNames[0] === columnName,
      ) ?? false
    );
  }
}
