# Turbo integration reference

This document records the inspected Turbo source contracts used by XDR API. Turbo is read-only
from this repository. Source paths below are relative to the sibling `turbo-cloud` project.
The routes described as existing are present in that source; Nest wrappers are separate XDR
routes. No live Turbo server was available for end-to-end verification.

## Existing Turbo authentication and routes

### Turbo Web

The public API is mounted under `/api` by `Turbo.Web/Api/WebApiServer.cs`.
`Turbo.Web/Api/DiscordEndpoints.cs` provides:

| Existing route | Authentication and purpose |
| --- | --- |
| `GET /api/auth/discord` | Starts Discord OAuth and writes state in a Turbo Web cookie. |
| `GET /api/auth/discord/callback` | Completes OAuth after checking state; signs in an existing linked player or starts the Turbo sign-up flow. |

`Turbo.Web/Api/AccountEndpoints.cs` provides:

| Existing route | Authentication and purpose |
| --- | --- |
| `GET /api/config` | Public site configuration. |
| `GET /api/me` | Reads the Turbo Web session or pending Discord sign-up cookies. |
| `GET /api/names/{name}` | Checks a proposed Turbo player name. |
| `POST /api/sign-up` | Completes Turbo's pending Discord sign-up and creates a player through Turbo's player/account services. |
| `POST /api/play` | Requires the Turbo Web session cookie; checks player sanctions and issues a game login ticket. |
| `POST /api/sign-out` | Ends the Turbo Web cookie session. |

This is a Discord/cookie browser flow, not an API accepting an XDR JWT. It does not establish an
XDR account relationship and is not used as a compatibility layer for XDR account authentication.
Relevant implementation and data files are `Turbo.Web/Accounts/`, `Turbo.Web/Sessions/`,
`Turbo.Web/Discord/`, `Turbo.Database/Entities/Security/WebSessionEntity.cs`,
`Turbo.Database/Entities/Security/PlayerDiscordLinkEntity.cs`, and
`Turbo.Database/Entities/Security/SecurityTicketEntity.cs`.

Turbo's `player_discord_links` table enforces one Discord identity per player and one player per
Discord identity. `PlayerDiscordLinkEntity` documents that one-to-one relationship and declares
unique indexes on both identifiers. `PlayerEntity` is Turbo's game-player identity; XDR must not
write it directly.

### Turbo Admin

`Turbo.Admin/Api/AdminApiServer.cs` mounts the secured API under `/api`. Every secured call passes
through `Turbo.Admin/Api/AdminSessionFilter.cs`: it validates a live Turbo Admin session and checks
`admin.panel` on the session's player. The credential is an individual Turbo Admin bearer session
issued by Turbo's passkey flow. Each endpoint/service continues to enforce its own Turbo permission
and, for mutations, acts as that same Turbo player. The XDR bearer token is not sent to Turbo as an
Admin credential. `Turbo.Admin/Api/AuthEndpoints.cs` defines the Admin identity/session routes.

Relevant existing capabilities:

| Existing route family | Source | Ownership / authorization |
| --- | --- | --- |
| `GET /api/players/`, `GET /api/players/{id}`, inventory, visits, and `POST /api/players/{id}/actions` | `Turbo.Admin/Api/PlayerEndpoints.cs` | Player queries require Turbo player-view permission; actions are built as operator commands and run as the authenticated staff member. Ban, unban, silence, unsilence, tradelock, untradelock, warn, and other commands remain Turbo-owned operations. |
| `POST /api/players/`, ticket status/issue/revoke at `/api/players/{id}/ticket`, and Turbo site-session operations | `Turbo.Admin/Api/PlayerAccountEndpoints.cs` | Player creation, login tickets, and site-session management are authorized by Turbo; ticket issuance uses `ILoginTicketService` and Turbo's ticket policy. |
| Room search/detail and room actions under `/api/rooms` | `Turbo.Admin/Api/RoomEndpoints.cs` | Turbo checks `admin.rooms.view`, then room-specific abilities, room ownership/rights, and acting staff identity through room grains/services. |
| Permission catalog, holder search, player permissions/check/audit and edits under `/api/permissions` | `Turbo.Admin/Api/PermissionLookupEndpoints.cs`, `Turbo.Admin/Api/PermissionPlayerEndpoints.cs`, and `Turbo.Admin/Api/PermissionResults.cs` | The API requires a valid Admin session and Turbo permission-view access; the Turbo permission resolver decides registration and grants. |
| Catalog tree/editor routes under `/api/catalog` | `Turbo.Admin/Api/CatalogEndpoints.cs` | Turbo checks catalog view/manage permissions and applies edits through `ICatalogEditService`; XDR currently wraps catalog reads only. |
| `GET /api/live` | `Turbo.Admin/Api/LiveEndpoints.cs` | Server-sent changes are filtered by the live Turbo session and room/player/permission access. |
| Admin identity | `Turbo.Admin/Api/AdminSessionFilter.cs` and `Turbo.Admin/Api/AdminIdentity.cs` | A request is attributed to its individually authenticated Turbo Admin player. |

Permission resolution, node registration, group inheritance, weights, wildcards, expirations and
permission auditing are Turbo concerns. See `docs/permissions.md` and the resolver/grain code under
`Turbo.Primitives/Players/Permissions/` and `Turbo.Players/Permissions/`.

## XDR routes implemented

All protected ACP routes require **both** an active XDR website access token and the caller's
separate `X-Turbo-Admin-Token`. `TurboAdminGuard` verifies the Turbo identity using `/api/me`;
Turbo then independently validates the same bearer and enforces its route permissions.

| XDR route | Existing Turbo route called | Notes |
| --- | --- | --- |
| `GET /turbo/admin/me` | `GET /api/me` | Validates and returns the individual Admin identity. |
| `GET /turbo/players`, `GET /turbo/players/{playerId}` | Player search/detail | Search parameters and IDs are bounded. |
| `POST /turbo/players/{playerId}/actions` | Player actions | DTO allowlists sanction/command actions; no command-string or arbitrary proxy surface. |
| `GET`, `POST`, `DELETE /turbo/players/{playerId}/ticket` | Ticket status/issue/revoke | Ticket values are returned only to the caller; XDR audit records never contain the ticket. |
| `GET /turbo/rooms`, `GET /turbo/rooms/{roomId}` | Room search/detail | Read-only wrapper. |
| `GET /turbo/catalog` | Catalog tree | Read-only wrapper. |
| `GET /turbo/permissions/catalog`, `GET /turbo/permissions/players/{playerId}/check` | Permission catalog/check | Invalid or unregistered permission responses are denied; no TypeScript permission resolver. |
| `GET /turbo/live` | Live server-sent events | Streams Turbo's filtered feed without retrying or rewriting events. |

Typed request/response contracts and the HTTP client live in `src/modules/turbo/`. Calls have a
configurable base URL and timeout, explicit upstream error mapping, and no automatic mutation
retry. Game mutations are recorded in `xdr_audit_logs` as well as retaining Turbo's own operation
audit. The XDR audit excludes the issued ticket, bearer values, and action reasons.

The API returns HTTP 503 when Turbo is unconfigured or unavailable. A response indicating an
unregistered or denied Turbo permission is HTTP 403; there is no local permission fallback.

## Missing Turbo integration capabilities

1. **XDR account/player relationship:** Turbo currently has a one-to-one Discord/player link, but
   no XDR identity, XDR-account association, or suitable XDR-facing linking operation. XDR records
   a future mapping in its own `xdr_account_players` table with `UNIQUE(player_id)`, allowing
   multiple players per XDR account and at most one XDR account per player. No public linking or
   player-creation endpoint is exposed until Turbo provides a suitable authorized flow. The
   existing Turbo Admin player-creation flow is staff-only and does not bind the player to an XDR
   account.
2. **CMS permissions:** the inspected Turbo source does not register `cms.*` nodes. Consequently
   XDR article, website-setting, audit-log and staff-session administrative operations fail closed
   when Turbo reports those nodes as unregistered. Turbo must register the needed CMS nodes and
   make grants manageable through its existing permission system before those operations can be
   authorized. The existing `GET /api/permissions/players/{id}/check` endpoint is itself behind
   `admin.permissions.view`, so staff using these XDR CMS guards must also be allowed to query
   resolved permissions, or Turbo must expose a suitably scoped check endpoint. XDR does not add
   a substitute role/permission model.
3. **Live verification:** typed requests are based on inspected routes/contracts, but no Turbo
   service URL or staff session was available to verify network connectivity, deployed-version
   parity, or the complete end-to-end response shapes.

There is no XDR shop/payment integration, media upload feature, direct Turbo table access, or
generic Turbo endpoint proxy.
