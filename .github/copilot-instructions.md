# XDR API project instructions

- This repository is the NestJS backend. Do not add or modify frontend applications.
- The sibling `turbo-cloud` project is a read-only integration reference; never change it from this repository's tasks.
- Use the existing NestJS, TypeORM, MySQL, npm, validation, response-envelope, and error-handling conventions.
- NestJS owns only `xdr_*` schema. TypeORM synchronization and automatic migrations stay disabled. The migration datasource uses the explicit `XdrEntities` registry and the `xdr_migrations` table.
- Do not add XDR role/permission tables, game-table entities, direct Turbo database writes, media uploads, `xdr_media`, or payment-shop features.
- Turbo is authoritative for game/CMS permission resolution and game mutations. Send the individual staff member's Turbo Admin bearer token to typed Turbo clients; an XDR JWT is not a Turbo token. Fail closed on unavailable, invalid, or unregistered Turbo permissions.
- Keep website-account sessions distinct from Turbo Admin sessions and game login tickets. Persist only password/token hashes and include the website session ID in XDR access tokens.
- Record XDR administrative actions without passwords, bearer tokens, refresh tokens, verification tokens, recovery tokens, or issued game tickets. Preserve Turbo's own game-operation audit trail and identity.
- Keep integration claims tied to inspected Turbo source and distinguish verified source contracts from live-server validation.
- Document API, schema, and Turbo integration changes in `docs/api-plan.md`, `docs/database-model.md`, and `docs/turbo-integration.md` as applicable.
- Run `npm run build`, `npm test -- --runInBand`, and `npm run test:e2e -- --runInBand` for backend changes when feasible.
