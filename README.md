# XDR API

## Current account

`GET /account` is the only endpoint for retrieving the signed-in account.
It requires a valid Bearer access token and an active website session.
The account ID is taken from the authenticated session, not from client input.

The response preserves the existing `status`, `code`, and `data` envelope:

```json
{
  "status": "ok",
  "code": 200,
  "data": {
    "id": 42,
    "email": "player@example.com",
    "emailVerified": false,
    "createdAt": "2026-10-14T05:00:00.000Z",
    "avatars": [],
    "activeAvatar": null,
    "permissions": ["cms.articles.manage"]
  }
}
```

`permissions` contains the account's effective granted permission nodes and is
an empty array when no nodes are granted. Use it for UI visibility only; API
routes continue to enforce their own permissions. Lookup failures return an
error rather than an empty permissions array.

### Frontend migration

`GET /auth/me` has been removed and returns HTTP 404. Replace all frontend calls
to `/auth/me` with `/account`, keeping the same Authorization header. The account
data and permissions are available together under `data`; no second request is
needed. The frontend is maintained outside this repository and must be updated
alongside this API change.

This consolidation does not change tokens, registration, login, password/email
flows, or the other `/account` routes. It requires no database migration.

The API's OpenAPI documentation is available at `/api/docs`.
