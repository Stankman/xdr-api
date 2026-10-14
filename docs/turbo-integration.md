# Turbo emulator contract

XDR no longer calls the Turbo Admin API. It shares the emulator's MySQL database and owns the
website side of it: accounts, sessions, CMS content, XDR permissions and the account-to-player
link. This document records the emulator contract XDR depends on and the Turbo behaviors it
deliberately does not reproduce.

Claims below were checked against the read-only `turbo-cloud` source (EF Core model snapshot,
`PlayerEntity`, `PlayerAccountService`, `PermissionResolver`/`PermissionNodeFormat`). None of
them was validated against a live Turbo server or database.

## Player creation on public registration

`POST /auth/register` inserts one row into Turbo's `players` table inside the same transaction as
the XDR account, its `xdr_account_players` link and its verification token:

```sql
INSERT INTO `players` (`name`, `motto`, `figure`, `gender`, `status`) VALUES (?, '', ?, 0, 0)
```

| Column | Value | Source contract |
| --- | --- | --- |
| `id` | Auto-increment; read from the insert result and stored as `xdr_account_players.player_id` | `int` identity |
| `name` | `registrationPlayerName()`: `<up to 8 [a-z0-9_]>_<6 hex>` | `varchar(512)`, unique index `IX_players_name`; Turbo names are 3–15 chars of `[A-Za-z0-9-=?!@:.,_]`, not starting with `@` |
| `motto` | `''` | Matches `PlayerAccountService` |
| `figure` | `registration.default_avatar` setting, else the built-in default | `varchar(279)`, required |
| `gender` | `0` (male) | Matches `PlayerAccountService` |
| `status` | `0` (offline) | Matches `PlayerAccountService` |
| others | Database defaults (`created_at`, respect counters, nullable dates) | EF snapshot defaults |

A duplicate on `IX_players_name` causes the whole registration transaction to be retried with a
new name (five attempts, then `503`). MySQL 8 reports duplicates as
`Duplicate entry '…' for key 'players.IX_players_name'`; XDR parses the index name from that
message, so a renamed index would surface as an unexpected error rather than a retry.

### Not reproduced from Turbo

- **Owner bootstrap.** Turbo's `PlayerAccountService` triggers owner/bootstrap work through its
  Orleans grains after creating a player. XDR writes only the row; anything Turbo initializes
  lazily for a new player must tolerate a player created this way.
- **Word filter.** Turbo's name filter is not applied. Generated names contain only lowercase
  alphanumerics and underscores, so this matters only if the name prefix is made configurable.
- **Turbo audit.** Turbo does not record these inserts; XDR's account/player link is the record.

## Permissions

CMS access is no longer resolved by Turbo. XDR keeps its own account-based groups and ports only
the node-matching rules of Turbo's `PermissionResolver` (exact > longest `prefix.*` > `*`, deny on
a tie, highest-weight group with an opinion decides, implicit `default` group). Turbo group
inheritance, per-player nodes, metadata and temporary node assignments are not modelled. Turbo's
own permission tables are neither read nor written. See [api-plan.md](api-plan.md#xdr-permissions).

## Removed integration

The following were deleted and have no replacement:

- the typed Turbo Admin client, `TurboPermissionService`, `TurboAdminGuard`,
  `TurboPermissionGuard` and `@RequireTurboPermission`;
- all `/turbo/*` routes (player/room/catalog reads, sanctions, game login tickets, permission
  checks, live events);
- the `X-Turbo-Admin-Token` header and Swagger security scheme;
- the `TURBO_ADMIN_BASE_URL` / `TURBO_TIMEOUT_MS` configuration.

Game login tickets and game mutations must now be handled by Turbo's own clients; XDR does not
issue them.