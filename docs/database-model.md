# Database ownership and model

NestJS manages XDR website data only. The runtime disables TypeORM schema synchronization and
automatic migrations. `src/providers/database/xdr-data-source.ts` explicitly registers
`XdrEntities` and the `xdr_migrations` migration-history table. No Turbo or emulator entity is
registered in that datasource.

[schema.sql](schema.sql) is generated from those seven XDR TypeORM entities. It is a reference
schema, not a dump from MySQL and not a substitute for reviewing/running migrations.

## Table inventory

| Table | Entity | Purpose |
| --- | --- | --- |
| `xdr_accounts` | `Account` | Unique email, password hash, verification state, registration/login IP and timestamps. |
| `xdr_sessions` | `AccountSession` | Website sessions with unique refresh-token hash, account, activity/expiry/revocation timestamps and request metadata. |
| `xdr_account_tokens` | `AccountToken` | Hashed, purpose-scoped, one-time email verification, password recovery and consumed refresh-token records. |
| `xdr_account_players` | `AccountPlayer` | XDR-side mapping of account to Turbo player ID; `player_id` is unique. |
| `xdr_articles` | `Article` | Draft/publication state, static asset paths, author account and content. |
| `xdr_settings` | `XdrSetting` | Website setting key/value records. Public reads and writes are restricted to an explicit key allowlist in the service. |
| `xdr_audit_logs` | `AuditLog` | Website administrative actor, action, target, result, request/correlation ID and non-secret details. |

The TypeORM CLI creates `xdr_migrations` to track migration versions. It is not an application
entity/table. The schema exporter outputs only the seven entity-backed tables.

## Relationships and constraints

- `xdr_accounts.id` is the website account key. Email is unique and normalized to lowercase by
  authentication flows.
- `xdr_sessions.account_id`, `xdr_account_tokens.account_id`, and
  `xdr_account_players.account_id` reference `xdr_accounts.id` and cascade on account deletion.
- `xdr_sessions.refresh_token_hash` and `xdr_account_tokens.token_hash` are unique hashes. Raw
  access/refresh/verification/recovery values are never persisted.
- `xdr_account_players` intentionally has **no foreign key to Turbo's player table**. It enforces
  one XDR account per Turbo player while allowing multiple player IDs per XDR account. Turbo
  `PlayerEntity.Id` is a signed integer, so the mapped ID column is signed too.
- `xdr_articles.author_account_id` references an XDR account and becomes `NULL` when that account
  is deleted. Articles are publicly visible only when `hidden = false` and `published_at` is set.
- `xdr_audit_logs` deliberately has no actor foreign keys, so audit history can survive account
  deletion and store Turbo actor IDs without coupling the tables.
- `xdr_settings` is a key/value store, but API services do not expose arbitrary keys. Public
  access is limited to `public.site_name`, `public.site_description`, `public.support_url`, and
  `public.maintenance_message`.

## Turbo data is not XDR persistence

Turbo owns player rows, Discord links, game login tickets, sanctions, rooms, catalog, groups,
permissions and game-operation audit. XDR does not map those tables and never writes them directly.
The XDR player-association table exists for the intended one-account-to-many-players relationship,
but is not populated through an API because the inspected Turbo source has no suitable authenticated
XDR linking flow. See [turbo-integration.md](turbo-integration.md).

There are no `xdr_roles`, `xdr_permissions`, role assignments, `xdr_media`, payment-shop tables,
or Turbo table mappings in the XDR entity registry.

## Migration behavior

The foundation migration creates/extends only `xdr_*` tables. For existing legacy XDR account and
article tables it adds verification/publication/account-author fields, establishes uniqueness,
normalizes article slugs, and backfills publication timestamps for already visible articles.
Before applying it to production:

1. Back up the database.
2. Resolve any duplicate case-insensitive account emails or refresh-token hashes reported by the
   migration; it will not merge them automatically.
3. Review the migration SQL against the actual XDR tables.
4. Run `npm run migration:run` with the intended `MYSQL_*` configuration.

The migration and generated metadata were checked locally, but no live MySQL migration was run in
this environment.
