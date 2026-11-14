# Front-end to API integration

This branch adds the layer the React screens use to talk to the back-end API (`server/`). Screens should call these functions instead of using `fetch` directly.

## Setup

1. Start the API: `cd server && npm install && npm run dev` (needs `server/.env`, see `server/.env.example`).
2. Start the front end: `npm install && npm run dev`.
3. In local dev, Vite proxies `/api` to `http://localhost:3100`, so no extra config is needed.
4. On Vercel, set `VITE_API_URL` to the Render API URL (see `.env.example`).

## What's included

| File | Purpose |
| --- | --- |
| `src/api/client.js` | Shared request function. Adds the JWT, handles errors, clears the token on 401. |
| `src/api/auth.js` | `register`, `login`, `getCurrentUser`, `logout` |
| `src/api/campaigns.js` | `listCampaigns`, `getCampaign`, `createCampaign`, `updateCampaign`, `deleteCampaign`, `listCategories` |
| `src/context/AuthProvider.jsx` | Keeps the logged-in user for the whole app and restores the session on refresh. |
| `src/hooks/useAuth.js` | `const { user, isAuthenticated, loading, login, register, logout } = useAuth()` |
| `src/hooks/useCampaigns.js` | `const { items, total, loading, error, reload } = useCampaigns({ page, categoryId, status })` |

## Examples

Login form (T2SA-47):

```jsx
const { login } = useAuth();
const [error, setError] = useState('');

async function handleSubmit(e) {
  e.preventDefault();
  try {
    await login({ email, password });
    // go to campaign list
  } catch (err) {
    setError(err.message); // e.g. "Invalid email or password."
  }
}
```

Validation errors from register come back in `err.details` as `[{ path, message }]`, so each field can show its own message.

Campaign list (T2SA-31):

```jsx
const { items, loading, error } = useCampaigns({ status: 'active' });
if (loading) return <p>Loading…</p>;
if (error) return <p>{error.message}</p>;
return items.map((c) => <CampaignCard key={c.id} campaign={c} />);
```

Logout: `const { logout } = useAuth(); <button onClick={logout}>Log out</button>`
