# Campaign API

Base URL (local): `http://localhost:3100`
Base URL (production): `https://<your-render-service>.onrender.com`

All responses are JSON. All request bodies must be JSON (`Content-Type: application/json`) unless noted otherwise.

## Authentication

Protected endpoints require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are issued by `/api/auth/register` and `/api/auth/login` and expire after `JWT_EXPIRES_IN` (default `7d`). The client stores the token and sends it with every protected request. There is no refresh token in this version; when the token expires the user signs in again.

## Error format

Every error uses the same envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [{ "path": "title", "message": "Title is required." }]
  }
}
```

`details` is optional and currently only used for validation errors. HTTP status codes:

| Status | Meaning |
| --- | --- |
| 200 | OK |
| 201 | Created |
| 204 | Deleted (empty body) |
| 400 | Validation error / invalid reference / invalid id |
| 401 | Missing, invalid or expired token, wrong credentials |
| 403 | Authenticated but not the owner of the resource |
| 404 | Resource or route not found |
| 409 | Email already registered / unique conflict |
| 413 | Request body too large |
| 429 | Too many failed auth attempts (15 min window) |
| 500 | Unexpected server error |

Error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INVALID_CATEGORY`, `INVALID_DATE_RANGE`, `INVALID_JSON`, `INVALID_REFERENCE`, `INVALID_ID`, `PAYLOAD_TOO_LARGE`, `TOO_MANY_REQUESTS`, `INTERNAL_ERROR`.

## Data types

### User

```json
{
  "id": "b3f1c2d4-...",
  "name": "Jiacheng",
  "email": "jiacheng@example.com",
  "createdAt": "2026-11-09T00:00:00.000Z"
}
```

`passwordHash` is never returned by any endpoint.

### Category

```json
{ "id": 1, "name": "Community", "slug": "community" }
```

### Campaign

```json
{
  "id": "5c7e...-uuid",
  "ownerId": "b3f1c2d4-...",
  "title": "Clean Water for Every Village",
  "description": "Funding water filters for three villages.",
  "goalAmount": 5000,
  "status": "active",
  "startDate": "2026-11-01",
  "endDate": "2027-03-31",
  "category": { "id": 1, "name": "Community", "slug": "community" },
  "owner": { "id": "b3f1c2d4-...", "name": "Jiacheng" },
  "createdAt": "2026-11-09T00:00:00.000Z",
  "updatedAt": "2026-11-09T00:00:00.000Z"
}
```

- `goalAmount` is a number (or `null`).
- `startDate` / `endDate` are `YYYY-MM-DD` strings (or `null`).
- `status` is one of `draft`, `active`, `completed`.
- `category` can be `null` if no category was selected.

---

## Auth endpoints

### POST /api/auth/register

Creates an account and returns a token.

Request body:

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | required, 1–100 chars |
| `email` | string | required, valid email, unique, stored lowercase |
| `password` | string | required, 8–72 chars |

```bash
curl -X POST http://localhost:3100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jiacheng","email":"jiacheng@example.com","password":"Passw0rd!"}'
```

Response `201`:

```json
{
  "user": { "id": "b3f1...", "name": "Jiacheng", "email": "jiacheng@example.com", "createdAt": "2026-11-09T00:00:00.000Z" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Errors: `400 VALIDATION_ERROR`, `409 CONFLICT` (email already registered).

### POST /api/auth/login

Request body: `{ "email": "...", "password": "..." }`

Response `200`: same shape as register. Wrong email and wrong password both return `401 UNAUTHORIZED` with the message `Invalid email or password.`

```bash
curl -X POST http://localhost:3100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jiacheng@example.com","password":"Passw0rd!"}'
```

### GET /api/auth/me

Requires `Authorization`. Returns the current user, used to restore the session after a page refresh.

Response `200`:

```json
{ "user": { "id": "b3f1...", "name": "Jiacheng", "email": "jiacheng@example.com", "createdAt": "..." } }
```

---

## Category endpoints

### GET /api/categories

Public. Returns all categories sorted by name.

Response `200`:

```json
{
  "categories": [
    { "id": 6, "name": "Arts & Culture", "slug": "arts-culture" },
    { "id": 4, "name": "Community", "slug": "community" }
  ]
}
```

---

## Campaign endpoints

### GET /api/campaigns

Public. Returns a paginated list of campaigns, newest first.

Query parameters:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer ≥ 1 | 1 | Page number |
| `limit` | integer 1–50 | 10 | Page size |
| `categoryId` | integer | – | Filter by category |
| `status` | `draft` \| `active` \| `completed` | – | Filter by status |

```bash
curl "http://localhost:3100/api/campaigns?page=1&limit=10&categoryId=4&status=active"
```

Response `200`:

```json
{
  "items": [ { "id": "...", "title": "...", "...": "..." } ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

### GET /api/campaigns/:id

Public. `id` must be a UUID; anything else returns `400 VALIDATION_ERROR`.

Response `200`: `{ "campaign": { ... } }`
Errors: `400 VALIDATION_ERROR`, `404 NOT_FOUND`.

### POST /api/campaigns

Requires `Authorization`. The campaign owner is always the authenticated user; any `ownerId` field in the body is ignored.

Request body:

| Field | Type | Rules |
| --- | --- | --- |
| `title` | string | required, 1–200 chars |
| `description` | string \| null | optional, ≤ 5000 chars |
| `goalAmount` | number \| null | optional, > 0 |
| `categoryId` | integer \| null | optional, must exist |
| `status` | enum | optional, defaults to `draft` |
| `startDate` | date string \| null | optional, `YYYY-MM-DD` or ISO |
| `endDate` | date string \| null | optional, must be ≥ `startDate` |

```bash
curl -X POST http://localhost:3100/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Water for Every Village",
    "description": "Funding water filters for three villages.",
    "goalAmount": 5000,
    "categoryId": 4,
    "status": "active",
    "startDate": "2026-11-01",
    "endDate": "2027-03-31"
  }'
```

Response `201`: `{ "campaign": { ... } }`
Errors: `400 VALIDATION_ERROR`, `400 INVALID_CATEGORY`, `400 INVALID_DATE_RANGE`, `401 UNAUTHORIZED`.

### PATCH /api/campaigns/:id

Requires `Authorization` **and ownership**. Only the campaign's `ownerId` may update it; anyone else gets `403 FORBIDDEN`. The body is a partial update — send only the fields to change. `title` cannot be empty. Sending `null` clears `description`, `goalAmount`, `categoryId`, `startDate` or `endDate`.

```bash
curl -X PATCH http://localhost:3100/api/campaigns/$CAMPAIGN_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","goalAmount":6000}'
```

Response `200`: `{ "campaign": { ... } }`
Errors: `400 VALIDATION_ERROR`, `400 INVALID_CATEGORY`, `400 INVALID_DATE_RANGE`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

### DELETE /api/campaigns/:id

Requires `Authorization` **and ownership**.

Response `204` with no body.
Errors: `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND`.

---

## Health endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Liveness. `{ "status": "ok", "uptime": 12.3, "timestamp": "..." }` |
| GET | `/health/db` | Checks the database with `SELECT 1`; returns 500 if unreachable. |

---

## Frontend integration notes

- Set the API base URL in the React app via a Vercel environment variable, e.g. `VITE_API_URL=https://<service>.onrender.com`, then call `${import.meta.env.VITE_API_URL}/api/...`.
- Store the JWT (e.g. `localStorage`) and attach `Authorization: Bearer <token>`.
- Registration/login/`me` return the same `user` object shape, so the frontend can use one type.
- On `401`, clear the token and redirect to login.
- On `403` for campaign updates, the current user is not the owner.
- The API allows the production Vercel domain, `*.vercel.app` preview URLs and `localhost` for CORS. Add a custom domain to `CORS_ORIGIN` on Render.
