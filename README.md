# XDR API

NestJS backend for XDR website accounts and content, with a typed integration to the Turbo Admin
API. This repository does not include or modify a frontend.

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

## Turbo reference

Turbo remains authoritative for game state, permission resolution, game login tickets, and game
mutations. XDR requests that access Turbo Admin need both an XDR access token and the caller's
individual Turbo Admin bearer session in `X-Turbo-Admin-Token`. Configure the private Turbo Admin
URL with `TURBO_ADMIN_BASE_URL`.

The inspected Turbo integration routes, authentication requirements, and unsupported XDR account
linking/CMS permission capabilities are documented in
[docs/turbo-integration.md](docs/turbo-integration.md). Live Turbo compatibility and live MySQL
migrations were not verified by local tests.

## Scope and plan

The current API excludes payment-shop endpoints, media uploads, XDR role/permission tables, direct
Turbo table writes, and frontend changes. See [docs/api-plan.md](docs/api-plan.md) for implemented
routes, operational configuration, test boundaries, and remaining integration blockers.

Unit tests cover pagination, session revocation/ownership, refresh rotation and reuse detection,
published-article filtering, Turbo authorization/failure handling, and mail configuration. The
e2e suite loads the application using XDR entity metadata without a database connection; it checks
configuration, Swagger, validation/authorization responses, XDR-only entities and migration scope.
It does not prove live MySQL migration execution, SMTP delivery, or Turbo connectivity/permissions.
