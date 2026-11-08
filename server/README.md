# Campaign API Backend

Express + PostgreSQL backend for the campaign platform. Implements the
authentication and campaign CRUD scope (FR-02, FR-03, NFR-03):

- User registration and login with **bcrypt**-hashed passwords.
- JWT authentication (`Authorization: Bearer <token>`).
- Campaign **create / read / update / delete** endpoints with owner-only
  authorization for updates and deletes.
- Campaign categories (seeded, read-only API).
- Security: parameterized queries via Prisma (no SQL string building),
  Helmet headers, CORS allow-list, request validation with zod, auth rate
  limiting, strict JSON error responses.

API reference: [`docs/API.md`](docs/API.md).

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Database | PostgreSQL (Render) |
| ORM | Prisma 6 |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Validation | zod |
| Deployment | Render (API + DB), Vercel (React frontend) |

## Project structure

```
server/
├── prisma/
│   ├── schema.prisma          # User / Category / Campaign models
│   ├── migrations/            # SQL migrations (committed)
│   └── seed.js                # Seed categories (idempotent)
├── src/
│   ├── app.js                 # Express app: middleware + routes
│   ├── server.js              # HTTP listener + graceful shutdown
│   ├── config/env.js          # Env validation
│   ├── lib/prisma.js          # Prisma client
│   ├── middleware/            # auth, validate, error handlers
│   ├── routes/                # /api/auth, /api/campaigns, /api/categories
│   ├── controllers/           # Request handlers
│   ├── validators/            # zod schemas
│   └── utils/                 # password, jwt, serializers, errors
├── docs/API.md                # Frontend-facing API contract
├── .env.example
└── package.json
```

## Local development

Requirements: Node.js 20+ and a PostgreSQL database (local or the Render
External Database URL).

```bash
cd server
npm install                 # runs `prisma generate` via postinstall
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: DATABASE_URL and JWT_SECRET are required
npm run db:deploy           # create tables from prisma/migrations
npm run db:seed             # insert categories
npm run dev                 # http://localhost:3100
```

If `npm install` skipped lifecycle scripts on your machine, run
`npx prisma generate` manually. If port 3100 is already in use, change `PORT`
in `.env`.

Smoke test:

```bash
curl http://localhost:3100/health
curl http://localhost:3100/api/categories
```

Register, log in and create a campaign with the examples in
[`docs/API.md`](docs/API.md).

## Manual testing

Import [`docs/postman_collection.json`](docs/postman_collection.json) into
Postman and follow [`docs/manual-testing.md`](docs/manual-testing.md). The
collection covers the happy path, ownership (`403`) and validation (`400`)
scenarios and fills in tokens/IDs automatically.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. Render external URLs end with `?sslmode=require`; Render internal URLs do not. |
| `JWT_SECRET` | yes | Signing secret. ≥ 32 chars in production. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `7d`. |
| `CORS_ORIGIN` | no | Comma-separated browser origins allowed to call the API (Vercel domain + localhost). Default `http://localhost:5173`. `*.vercel.app` previews are always allowed. |
| `PORT` | no | Default `3100`. Render injects it automatically. |
| `NODE_ENV` | no | `development` or `production`. |

`.env` must never be committed (it is in `.gitignore`).

## Deploy to Render

### 1. Create the PostgreSQL database

1. Render dashboard → **New → PostgreSQL**.
2. Pick the **same region** as the web service you will create (internal
   connections only work within a region).
3. After creation, copy the **Internal Database URL**. Use it as
   `DATABASE_URL` for the web service. Use the **External Database URL**
   (ending in `?sslmode=require`) only when connecting from your laptop.

### 2. Create the web service

1. **New → Web Service** → connect the GitHub repo.
2. **Root Directory**: `server` (if the repo also contains the React app).
3. **Build Command**: `npm install && npx prisma generate`
4. **Start Command**: `npm start`
   (`npm start` runs `prisma migrate deploy`, seeds categories, then starts
   the server.)
5. **Health Check Path**: `/health`
6. Environment variables:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | Internal Database URL from step 1 |
   | `JWT_SECRET` | long random string (≥ 32 chars) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CORS_ORIGIN` | `https://<your-app>.vercel.app` (comma-separate multiple origins) |
   | `NODE_ENV` | `production` |

7. Deploy. The first deploy applies the committed migration and inserts the
   default categories.

### 3. Verify the deployment

```bash
curl https://<service>.onrender.com/health
curl https://<service>.onrender.com/health/db
curl -X POST https://<service>.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Passw0rd!"}'
```

If the database check fails, confirm `DATABASE_URL` is the **Internal** URL
and that the database is in the same region as the service.

### Free-tier notes

- Free web services spin down after ~15 minutes without traffic; the next
  request pays a cold-start delay (tens of seconds). Hit `/health` before a
  demo.
- Free PostgreSQL plans have storage and lifetime limits. Check the Render
  dashboard and take a backup before an important demo.
- The server listens on `process.env.PORT`, which Render sets.

## Frontend (Vercel) integration

1. In the Vercel project settings add `VITE_API_URL=https://<service>.onrender.com`.
2. Re-deploy the frontend.
3. Example call:

   ```js
   const res = await fetch(`${import.meta.env.VITE_API_URL}/api/campaigns`, {
     headers: { Authorization: `Bearer ${token}` },
   });
   ```

4. Add the Vercel production domain to `CORS_ORIGIN` on Render. Custom
   domains must be added there too; `*.vercel.app` previews and localhost
   are allowed automatically.

## Security notes (NFR-03)

- Passwords are hashed with bcrypt (cost 10) and never returned or logged.
- All database access goes through Prisma, which uses parameterized queries —
  no SQL string concatenation anywhere.
- Helmet sets security headers; the API only returns JSON.
- CORS is restricted to configured origins, Vercel previews and localhost.
- zod validation strips unknown fields (prevents mass assignment) and bounds
  input lengths.
- Auth endpoints are rate-limited (30 failed attempts / 15 min / IP).
- JWTs expire; `JWT_SECRET` stays in Render environment variables.
- Not financial advice: TLS is terminated by Render, so production traffic is
  HTTPS automatically.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start with Node watch mode |
| `npm start` | Production start: migrate + seed + serve |
| `npm run start:plain` | Serve without migrations/seed |
| `npm run db:deploy` | Apply committed migrations |
| `npm run db:migrate` | Create a new migration during development |
| `npm run db:seed` | Seed categories |
| `npm run db:studio` | Open Prisma Studio |

## Scope notes

This service intentionally does **not** include FR-03's profile management or
campaign tracking, and categories are seeded rather than user-managed; those
are outside the assigned ticket. If the team later needs them, they can be
added without breaking the current API.
