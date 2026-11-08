# Manual testing guide

This walks through the backend by hand: register → login → campaign CRUD →
ownership → validation. It works against a local server or the deployed Render
API.

Two files help:

- [`postman_collection.json`](postman_collection.json) — importable Postman
  collection (27 requests with assertions and automatic token/campaign id
  handling).
- This guide.

## 1. Prerequisites

### A database

The API needs PostgreSQL. Until `DATABASE_URL` points at a running database,
every data endpoint returns `503 DATABASE_UNAVAILABLE` (only `/health` works).

**Option A — Render PostgreSQL (recommended; you need it for deployment anyway)**

1. Render dashboard → **New → PostgreSQL**. Pick the same region you will use
   for the web service.
2. Copy the **External Database URL** (it ends with `?sslmode=require`). Use it
   from your laptop.
3. Put it in `server/.env` as `DATABASE_URL`.

**Option B — local PostgreSQL**

Install PostgreSQL, create a database (for example `campaign_dev`), and use:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campaign_dev"
```

A local database normally does not need `?sslmode=require`.

### JWT secret

Set `JWT_SECRET` in `server/.env` to any random string of at least 32
characters. Example generator:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 2. Start the API

```bash
cd server
npm install
npm run db:deploy     # creates tables from prisma/migrations
npm run db:seed       # inserts the 8 categories
npm run dev           # http://localhost:3100
```

Verify:

```bash
curl http://localhost:3100/health
curl http://localhost:3100/health/db
```

`/health` returns `{"status":"ok"}` even without a database. `/health/db`
returns `{"status":"ok","database":"up"}` only when the DB is reachable.

> If `npm install` prints `install-scripts` warnings, run
> `npx prisma generate` once. If port 3100 is busy, change `PORT` in `.env`.

## 3. Import the Postman collection

1. Postman → **Import** → choose `server/docs/postman_collection.json`.
2. Open the collection → **Variables** tab → confirm
   `baseUrl = http://localhost:3100`. Change it to your Render URL later.
3. Run the folders **in order 00 → 06**. Each request has assertions in its
   **Tests** tab; a green result means the expected behaviour was observed.

You do not need to copy tokens by hand: the scripts store `token`, `tokenB`,
`userId`, `campaignId`, `ownershipCampaignId` and `categoryId` in collection
variables automatically.

## 4. What to expect

| Folder | Request | Expected |
| --- | --- | --- |
| 00 Health | `GET /health` | `200`, `status: "ok"` |
| 00 Health | `GET /health/db` | `200`, `database: "up"` |
| 01 Auth | Register | `201`, user object without `passwordHash`, JWT token |
| 01 Auth | Register duplicate email | `409 CONFLICT` |
| 01 Auth | Login | `200`, token |
| 01 Auth | Login wrong password | `401 UNAUTHORIZED` |
| 01 Auth | Me | `200`, same user id as register |
| 01 Auth | Me without token | `401 UNAUTHORIZED` |
| 02 Categories | List categories | `200`, array with 8 seeded items |
| 03 Campaigns | Create campaign | `201`, `ownerId` = your user id, `goalAmount: 5000` |
| 03 Campaigns | List campaigns | `200`, list contains the new campaign |
| 03 Campaigns | Get by id | `200`, same campaign |
| 03 Campaigns | Update (owner) | `200`, `status: "completed"`, `goalAmount: 6000` |
| 03 Campaigns | Delete (owner) | `204` |
| 03 Campaigns | Get deleted campaign | `404 NOT_FOUND` |
| 04 Ownership | Register second user | `201`, token stored as `tokenB` |
| 04 Ownership | Create campaign for ownership tests | `201` |
| 04 Ownership | Update as non-owner | `403 FORBIDDEN` |
| 04 Ownership | Delete as non-owner | `403 FORBIDDEN` |
| 04 Ownership | Campaign still readable | `200` (failed Write attempts must not modify it) |
| 05 Validation | Create without title | `400 VALIDATION_ERROR`, details include `title` |
| 05 Validation | endDate before startDate | `400 INVALID_DATE_RANGE` |
| 05 Validation | Update with unknown category | `400 INVALID_CATEGORY` |
| 05 Validation | Update with empty body | `400 VALIDATION_ERROR` |
| 05 Validation | Get with invalid id | `400 VALIDATION_ERROR` |
| 05 Validation | Create without token | `401 UNAUTHORIZED` |
| 06 Cleanup | Delete ownership campaign | `204` |

You can also open each response in Postman to inspect the camelCase JSON shape
(`goalAmount`, `startDate`, `createdAt`, `owner`, `category`) and the error
envelope `{ "error": { "code", "message", "details"? } }`.

## 5. Verify password hashing in the database

With `DATABASE_URL` set:

```bash
npx prisma studio
```

Open **users** and check:

- `password_hash` starts with `$2b$` and is 60 characters long.
- The plaintext password is nowhere in the row.
- **campaigns** rows have `owner_id` equal to the creating user's `id`.

This is the evidence for NFR-03 (bcrypt, no plaintext storage).

## 6. Test the deployed API

After the Render deployment, change the collection variable `baseUrl` to
`https://<service>.onrender.com` and run 00 → 06 again. Postman is not a
browser, so CORS does not matter here; this verifies the deployed API and its
database.

## 7. Without Postman: PowerShell quick path

```powershell
$base = 'http://localhost:3100'

$register = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register" `
  -ContentType 'application/json' -Body (@{
    name     = 'Manual Tester'
    email    = "tester.$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())@example.com"
    password = 'Passw0rd!'
  } | ConvertTo-Json)

$headers = @{ Authorization = "Bearer $($register.token)" }
Invoke-RestMethod -Method Get -Uri "$base/api/auth/me" -Headers $headers
Invoke-RestMethod -Method Get -Uri "$base/api/categories"

$created = Invoke-RestMethod -Method Post -Uri "$base/api/campaigns" -Headers $headers `
  -ContentType 'application/json' -Body (@{
    title      = 'Manual test campaign'
    goalAmount = 5000
    status     = 'active'
    startDate  = '2026-11-01'
    endDate    = '2027-03-31'
  } | ConvertTo-Json)

$id = $created.campaign.id
Invoke-RestMethod -Method Patch -Uri "$base/api/campaigns/$id" -Headers $headers `
  -ContentType 'application/json' -Body (@{ status = 'completed' } | ConvertTo-Json)
Invoke-RestMethod -Method Delete -Uri "$base/api/campaigns/$id" -Headers $headers
```

Try the negative cases by sending a request without the `Authorization` header
(expect `401`) or with a second user's token (expect `403`).

## 8. Common failures

| Symptom | Cause / fix |
| --- | --- |
| `503 DATABASE_UNAVAILABLE` | `DATABASE_URL` is wrong, the DB is asleep, or an external URL is missing `?sslmode=require`. |
| `401 UNAUTHORIZED` | Missing/expired token. Run Register or Login again; tokens last 7 days. |
| `409 CONFLICT` on register | The email already exists. The collection uses a timestamped email, so rerunning Register is fine. |
| `403 FORBIDDEN` | Expected in the ownership tests: the token does not own that campaign. |
| `429 TOO_MANY_REQUESTS` | 30 failed auth attempts per 15 minutes per IP. Wait, or restart the server to reset in-memory limits. |
| Server exits with `EADDRINUSE` | Port is taken. On this machine 3000/3001 are used by another app; keep `PORT=3100` or choose another free port. |
| Request hangs / connection refused | The API is not running, or you are calling the wrong port (3100 locally). |
| `P1001` in server logs | Prisma cannot reach PostgreSQL — same as the 503 case. |

## 9. Demo checklist

- Health and DB health.
- Register + duplicate registration.
- Login (correct and wrong password).
- `GET /me` with and without a token.
- Create → list → detail → update → delete a campaign.
- Second user tries to update/delete someone else's campaign → `403`.
- Validation: missing title, bad dates, unknown category, empty patch, invalid id.
- Prisma Studio: bcrypt hash and `owner_id` relationships.
