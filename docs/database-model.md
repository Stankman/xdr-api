# Database ownership and model

NestJS manages XDR website data. The runtime disables TypeORM schema synchronization and
automatic migrations. `src/providers/database/xdr-data-source.ts` explicitly registers
`XdrEntities` and the `xdr_migrations` migration-history table. No Turbo or emulator entity is
registered in that datasource.

[schema.sql](schema.sql) is generated from the ten XDR TypeORM entities. It is a reference schema,
not a dump from MySQL and not a substitute for reviewing/running migrations.

## Table inventory

| Table | Entity | Purpose |
| --- | --- | --- |
| `xdr_accounts` | `Account` | Unique email, password hash, verification state, registration/login IP and timestamps. |
| `xdr_sessions` | `AccountSession` | Website sessions with unique refresh-token hash, account, activity/expiry/revocation timestamps and request metadata. |
| `xdr_account_tokens` | `AccountToken` | Hashed, purpose-scoped, one-time email verification, password recovery and consumed refresh-token records. |
| `xdr_account_players` | `AccountPlayer` | Account to emulator player ID; `player_id` is unique. Written by public registration. |
| `xdr_articles` | `Article` | Draft/publication state, static asset paths, author account and content. |
| `xdr_settings` | `XdrSetting` | Website setting key/value records, including `registration.default_avatar`. Public reads and writes are restricted to an explicit key allowlist in the service. |
| `xdr_audit_logs` | `AuditLog` | Website administrative actor, action, target, result, request/correlation ID and non-secret details. |
| `xdr_permission_groups` | `PermissionGroup` | Named, weighted permission groups. `name` is unique. |
| `xdr_permission_group_nodes` | `PermissionGroupNode` | Node assignments (`node`, boolean `value`) per group; unique per (`group_id`, `node`). |
| `xdr_account_permission_groups` | `AccountPermissionGroup` | Account membership in a group with optional `expires_at`; unique per (`account_id`, `group_id`). |

The TypeORM CLI creates `xdr_migrations` to track migration versions. It is not an application
entity/table. The schema exporter outputs only the entity-backed tables.

## Relationships and constraints

- `xdr_accounts.id` is the website account key. Email is unique (`UQ_xdr_accounts_email`) and
  normalized to lowercase by authentication flows.
- `xdr_sessions.account_id`, `xdr_account_tokens.account_id`, `xdr_account_players.account_id` and
  `xdr_account_permission_groups.account_id` reference `xdr_accounts.id` and cascade on account
  deletion.
- `xdr_sessions.refresh_token_hash` and `xdr_account_tokens.token_hash` are unique hashes. Raw
  access/refresh/verification/recovery values are never persisted.
- `xdr_account_players` intentionally has **no foreign key to the emulator `players` table**. One
  account may map to several player IDs, but each player ID appears at most once (`player_id`
  unique). Public
  registration inserts the player and the link in the same transaction as the account, so the
  three rows are created or rolled back together. Turbo `players.id` is a signed integer, so the
  mapped ID column is signed too.
- `xdr_permission_group_nodes.group_id` and `xdr_account_permission_groups.group_id` reference
  `xdr_permission_groups.id` and cascade on group deletion.
- `xdr_articles.author_account_id` references an XDR account and becomes `NULL` when that account
  is deleted. Articles are publicly visible only when `hidden = false` and `published_at` is set.
- `xdr_audit_logs` deliberately has no actor foreign keys, so audit history survives account
  deletion. New administrative rows record `actor_player_id = NULL`; older rows may hold Turbo
  Admin player IDs.
- `xdr_settings` is a key/value store, but API services do not expose arbitrary keys. Public
  access is limited to `public.site_name`, `public.site_description`, `public.support_url`, and
  `public.maintenance_message`.

## Emulator data

XDR shares the MySQL database with the Turbo emulator but does not map its tables as entities.
The single emulator write is the raw, parameterized `INSERT INTO players (name, motto, figure,
gender, status)` performed by public registration; all other columns use the emulator's defaults.
See [turbo-integration.md](turbo-integration.md) for that contract. XDR does not read or write
Turbo's permission groups, sanctions, rooms, catalog or tickets.

There are no `xdr_media`, payment-shop tables, or Turbo table mappings in the XDR entity registry.

## Migration behavior

- `1770000000000-XdrApiFoundation` creates/extends `xdr_*` tables. For existing legacy XDR account
  and article tables it adds verification/publication/account-author fields, establishes
  uniqueness, normalizes article slugs, and backfills publication timestamps for already visible
  articles.
- `1791940000000-RegistrationDefaultAvatar` seeds `registration.default_avatar` without
  overwriting an existing value.
- `1792000000000-XdrPermissionGroups` creates the three permission tables (if absent), seeds the
  `default` (weight 0, no nodes) and `admin` (weight 100, node `*` = granted) groups idempotently,
  and drops the three tables on revert.

Before applying to production:

1. Back up the database.
2. Resolve any duplicate case-insensitive account emails or refresh-token hashes reported by the
   foundation migration; it will not merge them automatically.
3. Review the migration SQL against the actual tables.
4. Run `npm run migration:run` with the intended `MYSQL_*` configuration, then assign staff with
   `npm run permissions:assign -- --email <email> --group admin`.

The migrations and generated metadata were checked locally, but no live MySQL migration was run in
this environment.