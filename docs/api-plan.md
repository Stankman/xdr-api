# XDR API implementation and operations

## Scope

NestJS owns the website API and its `xdr_*` tables. It shares one MySQL database with the Turbo
emulator, and its only write to an emulator table is the `players` row created by public
registration (see [turbo-integration.md](turbo-integration.md)). XDR does not call the Turbo Admin
API. No frontend, payment shop, media upload, or other game-table write is part of this API.

## Implemented endpoint groups

The canonical request/response schemas are exposed by Swagger at `/api/docs`.

### Authentication and website accounts

| Method and route | Authentication | Purpose |
| --- | --- | --- |
| `POST /auth/register` | Public; rate limited | Create an unverified email account plus its emulator player, link them, and send a verification link. |
| `POST /auth/login` | Public; rate limited | Verify email/password and create an independent XDR website session. |
| `POST /auth/refresh` | Public; rate limited | Rotate the refresh token for its existing website session. |
| `POST /auth/email-verification/resend` | Public; rate limited | Resend verification without confirming whether an account exists. |
| `POST /auth/email-verification/confirm` | Public; rate limited | Consume a one-time email verification token. |
| `POST /auth/password/recovery` | Public; rate limited | Request a recovery link with an enumeration-resistant response. |
| `POST /auth/password/reset` | Public; rate limited | Consume a one-time recovery token and revoke the account's sessions. |
| `GET /auth/me`, `GET /account` | XDR access token | Return the current website account only. |
| `POST /auth/logout`, `POST /auth/logout-all` | XDR access token | Revoke the current website session or all sessions. |
| `GET /account/sessions?page=&limit=` | XDR access token | Paginated list of the caller's sessions. |
| `DELETE /account/sessions/{sessionId}`, `DELETE /account/sessions` | XDR access token | Revoke one owned session or all the caller's sessions. |
| `PATCH /account/password` | XDR access token | Check the current password, change it, and revoke all sessions. |

Website access tokens identify an XDR account and include the session ID. Every protected request
checks that session against `xdr_sessions`, so revocation takes effect immediately. Refresh
secrets, verification/recovery tokens and password values are never stored in plaintext. Each
refresh rotation stores the consumed token's hash. Replaying a consumed token revokes its session
and returns an unauthorized response; concurrent use is treated as reuse, not as a second valid
rotation. Refresh sessions last 30 days from creation/rotation.

Email delivery requires SMTP configuration and a non-empty `APP_PUBLIC_URL`. Registration and
recovery do not return verification/recovery secrets in API responses. A frontend must consume
email links under its configured public URL; no frontend was changed here.

#### Public registration

`POST /auth/register` performs one database transaction containing:

1. an email existence check (`409 Conflict` if taken);
2. the `xdr_accounts` row (unverified);
3. one emulator `players` row named by `registrationPlayerName` (`<prefix>_<6 hex>`), with an
   empty motto, male gender, offline status and the figure from the `registration.default_avatar`
   setting (falling back to the built-in default when the setting is missing, blank, or longer than
   279 characters);
4. the `xdr_account_players` link (`account_id`, `player_id`);
5. the hashed email-verification token.

The verification email is sent only after the transaction commits, and the response body is
unchanged. Any failure rolls back all four rows, so there is never an account without its player,
a player without its account, or a dangling link. Duplicate handling:

- **Same email, sequential or concurrent:** the unique `UQ_xdr_accounts_email` index serializes the
  inserts; the losing request rolls back (including its player) and returns `409`.
- **Generated player-name collision** (`IX_players_name`): the whole transaction is retried with a
  new name, up to five attempts, then `503 Service Unavailable` with nothing persisted.
- **Any other duplicate or database error** is rethrown unchanged after rollback.

Only public registration creates a player. Other account creation paths are unaffected.

### Content and CMS

| Method and route | Authentication | Purpose |
| --- | --- | --- |
| `GET /articles`, `GET /articles/available` | Public | Paginated published article list only. |
| `GET /articles/{id}`, `GET /articles/slug/{slug}` | Public | Published article detail only. |
| `GET /articles/admin` | XDR token + `cms.articles.manage` | Paginated draft/published administration list. |
| `POST /articles`, `PUT /articles/{id}`, `POST /articles/{id}/publish`, `DELETE /articles/{id}` | XDR token + `cms.articles.manage` | Draft creation, edit, publish, and delete. |
| `GET /settings/public` | Public | Return only the explicit public setting allowlist. |
| `GET /settings/admin`, `PUT /settings/admin/{key}`, `DELETE /settings/admin/{key}` | XDR token + `cms.settings.manage` | Read/change only allowlisted website settings. |
| `GET /admin/audit-logs` | XDR token + `cms.audit.view` | Paginated XDR administrative audit query; filters and date range are bounded. |
| `GET /admin/accounts/{accountId}/sessions?page=&limit=` | XDR token + `cms.accounts.sessions.view` | Paginated view of an account's XDR sessions. |
| `DELETE /admin/accounts/{accountId}/sessions/{sessionId}` | XDR token + `cms.accounts.sessions.manage` | Revoke a session only when it belongs to the selected account. |

Administrative routes use `AuthGuard` followed by `PermissionGuard` with `@RequirePermission(node)`.
No `X-Turbo-Admin-Token` header is used any more. Audit rows written by these routes record the
XDR account as the actor and `actor_player_id = NULL`.

Static image paths may be supplied for articles; uploads are not implemented. Public settings are
limited to `public.site_name`, `public.site_description`, `public.support_url`, and
`public.maintenance_message`.

### XDR permissions

Permissions are XDR account permission groups (`xdr_permission_groups`,
`xdr_permission_group_nodes`, `xdr_account_permission_groups`; see
[database-model.md](database-model.md)). Resolution follows the node-matching rules of Turbo's
`PermissionResolver`, ported to XDR:

- Nodes are lowercase dot-separated segments. An assignment is an exact node, a `prefix.*`
  wildcard, or `*`.
- Within a group the most specific matching assignment wins (exact > longest `prefix.*` > `*`);
  `prefix.*` does not match `prefix` itself. On an equally specific tie a denial wins.
- Groups are consulted by weight (highest first, then name). The first group with any matching
  assignment decides. Expired memberships are ignored, and every account implicitly belongs to
  `default`.
- Only nodes in the fixed XDR catalog can be granted: `cms.articles.manage`,
  `cms.settings.manage`, `cms.audit.view`, `cms.accounts.sessions.view`,
  `cms.accounts.sessions.manage`. Anything else, no opinion, or a lookup error is a denial.

Permissions are read on every request, so a revocation applies immediately. Denials are audited as
`authorization.permission.denied` (`target_type = xdr_permission`, `target_id` = node).

The migration seeds `default` (weight 0, no nodes) and `admin` (weight 100, `*`). There is no HTTP
management API; staff assignments are made with the CLI, which writes
`permission_group.assign`/`permission_group.remove` audit rows with a `NULL` actor:

```powershell
npm run permissions:assign -- --email staff@example.com --group admin [--expires 2030-01-01T00:00:00Z]
npm run permissions:remove -- --email staff@example.com --group admin
npm run permissions:list -- --email staff@example.com
```

Groups other than the two seeded ones and their nodes are created directly in the XDR tables.

### Removed Turbo Admin routes

The `/turbo/*` routes (player/room/catalog reads, sanctions, game login tickets, permission
checks, live events) and the typed Turbo Admin client were removed with no replacement.
`TURBO_ADMIN_BASE_URL` and `TURBO_TIMEOUT_MS` are no longer read; they may be deleted from
deployment environments.

## Data ownership and migration

The migration registry contains only XDR entities: accounts, account/player associations,
website sessions, hashed one-time/refresh token records, articles, settings, audit logs and the
permission group tables. Public registration is the only writer of `xdr_account_players`.

Runtime TypeORM has `synchronize: false` and `migrationsRun: false`. The CLI datasource registers
only `XdrEntities`, the XDR migrations, and the `xdr_migrations` history table.

```powershell
npm run migration:run
npm run migration:revert
npm run schema:export
```

Review the generated SQL and take a database backup before running a migration in production.
The migrations were not run against a live MySQL instance as part of this implementation.

## Configuration

Copy `.env.example` to a local `.env` and provide deployment-specific values. The example contains
no credentials. Production must configure a strong `TOKEN_SECRET` (at least 32 characters),
database credentials, SMTP credentials, and `APP_PUBLIC_URL`. An empty `TOKEN_SECRET` is accepted
only outside production, where an ephemeral process key invalidates access tokens on restart.

The database user must be able to insert into the emulator's `players` table in addition to the
`xdr_*` tables.

Authentication rate limiting is process-local. A multi-instance deployment must add a shared
limiter or enforce equivalent edge/proxy limits before scaling horizontally. Do not trust a
forwarded client IP unless the API is deployed behind a configured trusted proxy.

## Verification limits

Unit tests cover registration atomicity (success, avatar fallback, existing and concurrent
duplicate emails, name-collision retry and exhaustion, unrelated duplicates, rollback on late
failure), the permission resolver, guard and migration. The e2e suite boots the application on
entity metadata without a database. Local automated tests do not prove live MySQL behavior
(including the real `players` insert and duplicate-key messages), SMTP delivery, or production
permission assignments. No route is represented as live-verified.