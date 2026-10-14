-- Generated from TypeORM entity metadata by npm run schema:export.
-- XDR-owned tables only. This is a reference model, not a production migration.
-- Apply production changes only with the xdr-scoped TypeORM migrations.
-- No database connection is opened by the exporter.

CREATE TABLE `xdr_account_players` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `player_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `IDX_xdr_account_players_account` (`account_id`),
  UNIQUE INDEX `UQ_xdr_account_players_player` (`player_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `xdr_account_tokens` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `purpose` varchar(32) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `session_id` char(36) NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime NULL,
  INDEX `IDX_xdr_account_tokens_session` (`session_id`),
  INDEX `IDX_xdr_account_tokens_account_purpose` (`account_id`, `purpose`),
  UNIQUE INDEX `UQ_xdr_account_tokens_hash` (`token_hash`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `xdr_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email_verified` tinyint NOT NULL DEFAULT 0,
  `email_verified_at` datetime NULL,
  `last_login` datetime NULL,
  `ip_current` varchar(255) NULL,
  `ip_register` varchar(255) NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE INDEX `UQ_xdr_accounts_email` (`email`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `xdr_articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` varchar(500) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(2048) NOT NULL DEFAULT '',
  `thumbnail` varchar(2048) NOT NULL DEFAULT '',
  `author_account_id` int NULL,
  `hidden` tinyint NOT NULL DEFAULT 1,
  `pinned` tinyint NOT NULL DEFAULT 0,
  `published_at` datetime NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `IDX_xdr_articles_author_account` (`author_account_id`),
  INDEX `IDX_xdr_articles_publication` (`hidden`, `published_at`),
  UNIQUE INDEX `UQ_xdr_articles_slug` (`slug`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `xdr_audit_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_account_id` int NULL,
  `actor_player_id` int NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(80) NOT NULL,
  `target_id` varchar(128) NULL,
  `result` varchar(16) NOT NULL,
  `request_id` varchar(128) NOT NULL,
  `details` json NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX `IDX_xdr_audit_request_id` (`request_id`),
  INDEX `IDX_xdr_audit_target_created` (`target_type`, `target_id`, `created_at`),
  INDEX `IDX_xdr_audit_actor_created` (`actor_account_id`, `created_at`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `xdr_sessions` (
  `id` char(36) NOT NULL,
  `account_id` int NOT NULL,
  `refresh_token_hash` char(64) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `last_activity_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime NULL,
  `ip_address` varchar(45) NULL,
  `user_agent` varchar(512) NULL,
  INDEX `IDX_xdr_sessions_active` (`account_id`, `revoked_at`, `expires_at`),
  INDEX `IDX_xdr_sessions_account` (`account_id`),
  UNIQUE INDEX `UQ_xdr_sessions_refresh_hash` (`refresh_token_hash`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `xdr_settings` (
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB;

ALTER TABLE `xdr_account_players` ADD CONSTRAINT `FK_1c4cfd13550596991c4c1c31994` FOREIGN KEY (`account_id`) REFERENCES `xdr_accounts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `xdr_account_tokens` ADD CONSTRAINT `FK_d2c046b9273fea038176a71150b` FOREIGN KEY (`account_id`) REFERENCES `xdr_accounts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `xdr_articles` ADD CONSTRAINT `FK_69d95f9e39c9d6ace4a827a03d2` FOREIGN KEY (`author_account_id`) REFERENCES `xdr_accounts`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `xdr_sessions` ADD CONSTRAINT `FK_f3e0d53c9321db18fd0f79b0674` FOREIGN KEY (`account_id`) REFERENCES `xdr_accounts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
