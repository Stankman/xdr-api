# XDR API implementation and operations

## Scope

NestJS owns the website API and its `xdr_*` tables only. Turbo owns game/player state, game login
tickets, CMS/game permissions, game mutations, and the corresponding Turbo audit. No frontend,
payment shop, media upload, local role system, or direct Turbo database write is part of this API.

## Implemented endpoint groups

The canonical request/response schemas are exposed by Swagger at `/api/docs`.

### Authentication and website accounts

| Method and route | Authentication | Purpose |
| --- | --- | --- |
| `POST /auth/register` | Public; rate limited | Create an unverified email account and send a verification link. |
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

### Content and CMS

| Method and route | Authentication | Purpose |
| --- | --- | --- |
| `GET /articles`, `GET /articles/available` | Public | Paginated published article list only. |
| `GET /articles/{id}`, `GET /articles/slug/{slug}` | Public | Published article detail only. |
| `GET /articles/admin` | XDR token + Turbo Admin token + `cms.articles.manage` | Paginated draft/published administration list. |
| `POST /articles`, `PUT /articles/{id}`, `POST /articles/{id}/publish`, `DELETE /articles/{id}` | XDR token + Turbo Admin token + `cms.articles.manage` | Draft creation, edit, publish, and delete. |
| `GET /settings/public` | Public | Return only the explicit public setting allowlist. |
| `GET /settings/admin`, `PUT /settings/admin/{key}`, `DELETE /settings/admin/{key}` | XDR token + Turbo Admin token + `cms.settings.manage` | Read/change only allowlisted website settings. |
| `GET /admin/audit-logs` | XDR token + Turbo Admin token + `cms.audit.view` | Paginated XDR administrative audit query; filters and date range are bounded. |
| `GET /admin/accounts/{accountId}/sessions?page=&limit=` | XDR token + Turbo Admin token + `cms.accounts.sessions.view` | Paginated view of an account's XDR sessions. |
| `DELETE /admin/accounts/{accountId}/sessions/{sessionId}` | XDR token + Turbo Admin token + `cms.accounts.sessions.manage` | Revoke a session only when it belongs to the selected account. |

The currently inspected Turbo version does not register these `cms.*` nodes. These guards
therefore deny access until Turbo provides the corresponding nodes and a staff member has a Turbo
grant. The source contract and blocker are recorded in [turbo-integration.md](turbo-integration.md).
No local XDR role/permission fallback is enabled.

Static image paths may be supplied for articles; uploads are not implemented. Public settings are
limited to `public.site_name`, `public.site_description`, `public.support_url`, and
`public.maintenance_message`.

### Turbo ACP and game login tickets

The routes under `/turbo` require the XDR token plus the caller's own Turbo Admin bearer session.
The implemented wrappers cover player search/detail, bounded sanction actions, ticket
status/issue/revoke, room search/detail, catalog reads, permission catalog/check, Admin identity,
and Turbo live events. The XDR client calls only typed, inspected Turbo routes; it is not a generic
proxy. Mutations go through Turbo and record an XDR audit event without logging secrets or game
tickets. Turbo retains its own game-operation audit and sees the actual Admin identity.

Existing Turbo ticket issue APIs operate on Turbo player IDs and enforce Turbo's ticket policy and
permissions. They are separate from both XDR website sessions and Turbo Web's Discord cookie
session. See [turbo-integration.md](turbo-integration.md) for the source route inventory and
missing XDR-player association support.

## Data ownership and migration

The migration registry contains only XDR entities: accounts, account/player associations,
website sessions, hashed one-time/refresh token records, articles, settings, and audit logs.
`xdr_account_players` enforces the intended cardinality: one XDR account may map to multiple Turbo
player IDs, and one Turbo player ID may appear at most once. No API currently writes this mapping
because Turbo has no suitable authenticated linking flow.

Runtime TypeORM has `synchronize: false` and `migrationsRun: false`. The CLI datasource registers
only `XdrEntities`, its XDR-only migration, and the `xdr_migrations` history table.

```powershell
npm run migration:run
npm run migration:revert
npm run schema:export
```

Review the generated SQL and take a database backup before running a migration in production.
The migration was not run against a live MySQL instance as part of this implementation.

## Configuration

Copy `.env.example` to a local `.env` and provide deployment-specific values. The example contains
no credentials. Production must configure a strong `TOKEN_SECRET` (at least 32 characters),
database credentials, SMTP credentials, and `APP_PUBLIC_URL`. An empty `TOKEN_SECRET` is accepted
only outside production, where an ephemeral process key invalidates access tokens on restart.

`TURBO_ADMIN_BASE_URL` points to Turbo's Admin API (typically its private/loopback address), and
`TURBO_TIMEOUT_MS` bounds API requests. Each ACP caller provides their own Turbo Admin passkey
session token; no shared Turbo credential is configured in XDR.

Authentication rate limiting is process-local. A multi-instance deployment must add a shared
limiter or enforce equivalent edge/proxy limits before scaling horizontally. Do not trust a
forwarded client IP unless the API is deployed behind a configured trusted proxy.

## Implementation stages

1. **Inspection and ownership:** completed. Turbo Web/Admin endpoints, entities, permission docs,
   and relevant operations were inspected; ownership and integration gaps are in
   [turbo-integration.md](turbo-integration.md).
2. **XDR persistence and authentication:** implemented and unit-tested for refresh rotation and
   active-session checks. Live MySQL migrations and SMTP delivery remain deployment verification.
3. **Website content and audit:** public-only published article reads, guarded article/settings
   management, bounded audit query, staff session actions, request IDs, and XDR audit events are
   implemented. CMS actions currently deny because their Turbo nodes are unregistered.
4. **Turbo ACP:** typed wrappers for inspected player, room, ticket, sanction-action, catalog-read,
   permission-check and live APIs are implemented. Failure mapping, fail-closed permission
   behavior, and no-mutation-retry behavior are unit checked; live Turbo interoperability is not
   verified.
5. **Verification and handoff:** build, unit, e2e and schema metadata checks are run before
   deployment. External MySQL, SMTP, Turbo Admin, and Turbo CMS-node verification remain explicit
   deployment/integration tasks.

## Verification limits

Local automated tests do not prove live MySQL behavior, SMTP delivery, Turbo endpoint availability,
or production permission grants. See [turbo-integration.md](turbo-integration.md) for exact Turbo
blockers. No route is represented as live-verified.
