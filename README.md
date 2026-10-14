# XDR API

NestJS backend for XDR website accounts, content and CMS permissions. It shares the Turbo
emulator's MySQL database. This repository does not include or modify a frontend.

## Requirements

- Node.js 24.15 or newer within the Node 24 LTS line.
- npm.
- MySQL for runtime and migration execution.

Install and validate:

```powershell
npm ci
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Copy `.env.example` to `.env` for local configuration. Production requires a strong
`TOKEN_SECRET`, MySQL credentials, SMTP configuration, and an `APP_PUBLIC_URL` that serves the
verification/recovery links. Do not commit `.env` or real credentials.

```powershell
npm run start:dev
npm run start:prod
```

Swagger/OpenAPI is served at `/api/docs`. The default application port is 9000.

Public news is available at `GET /articles` and `GET /articles/available`.
Both accept `page` (1–100000), `limit` (1–100, default 10), and optional `q`
(at most 80 characters) to search titles and descriptions. Surrounding search
whitespace is ignored and wildcard characters are treated literally. Results
include only visible, published articles, ordered pinned first and newest first,
with `items` and `meta` pagination data inside the standard response envelope.
Deploy this search support alongside frontend URL-backed news search.

## Persistence

NestJS manages only XDR-owned tables. Synchronization and startup migrations are disabled. The
migration CLI datasource explicitly registers `XdrEntities` and uses `xdr_migrations`.

```powershell
npm run migration:run
npm run migration:revert
npm run schema:export
```

Review [docs/database-model.md](docs/database-model.md) and [docs/schema.sql](docs/schema.sql)
before applying production migrations. The schema export is a metadata reference, not a live
database dump or proof that a migration was applied.

## Turbo emulator

XDR does not use the Turbo Admin API. Public registration (`POST /auth/register`) creates the
website account, one emulator `players` row and their `xdr_account_players` link in a single
transaction. CMS routes are authorized by XDR's own account permission groups, assigned with:

```powershell
npm run permissions:assign -- --email staff@example.com --group admin
npm run permissions:list -- --email staff@example.com
npm run permissions:remove -- --email staff@example.com --group admin
```

The `players` insert contract and the Turbo behaviors not reproduced (owner bootstrap, word filter)
are documented in [docs/turbo-integration.md](docs/turbo-integration.md). Live Turbo compatibility
and live MySQL migrations were not verified by local tests.

## Scope and plan

The current API excludes payment-shop endpoints, media uploads, game-table writes other than the
registration player insert, and frontend changes. See [docs/api-plan.md](docs/api-plan.md) for
implemented routes, operational configuration and test boundaries.

Unit tests cover pagination, session revocation/ownership, refresh rotation and reuse detection,
published-article filtering, atomic registration with its player link, XDR permission resolution
and guarding, and mail configuration. The
e2e suite loads the application using XDR entity metadata without a database connection; it checks
configuration, Swagger, validation/authorization responses, XDR-only entities and migration scope.
It does not prove live MySQL migration execution, SMTP delivery, or the live `players` insert.
