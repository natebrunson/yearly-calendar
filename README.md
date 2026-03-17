# Year Calendar

A year-at-a-glance calendar displaying all 12 months as rows with 31 day columns. Create multi-day events that display as colored bars spanning across days.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript, Pinia, Tailwind CSS v4, Vite
- **Backend**: Hono + @hono/node-server
- **Auth**: Better Auth (Google + Apple OAuth)
- **Database**: SQLite (better-sqlite3)

## Prerequisites

- Node.js ^20.19.0 or >=22.12.0
- Google OAuth credentials (and/or Apple OAuth credentials)

## Setup

```sh
npm install
```

Create a `.env` file in the project root:

```
BETTER_AUTH_SECRET=<32+ character secret — generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:5173

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Optional
APPLE_CLIENT_ID=<your-apple-client-id>
APPLE_CLIENT_SECRET=<your-apple-client-secret>
```

For Google OAuth, set the authorized redirect URI to:
```
http://localhost:5173/api/auth/callback/google
```

## Development

Start both the Vite dev server and the Hono backend:

```sh
npm run dev
```

This runs two processes in parallel:
- **Vite** (frontend) on `http://localhost:5173` — serves the Vue SPA
- **Hono** (backend) on `http://localhost:3001` — handles auth and API routes

Vite proxies `/api/*` requests to the backend automatically.

You can also run them individually:

```sh
npm run dev:client   # Vite only
npm run dev:server   # Hono backend only (with file watching)
```

The SQLite database is created automatically at `data/calendar.db` on first server start.

## Production

Build the Vue frontend and start the server:

```sh
npm run build
npm start
```

This runs everything on a single port (default 3001). The Hono server serves both the API and the built SPA. Set `PORT` in your `.env` to change it.

Update `BETTER_AUTH_URL` in `.env` to match your production URL (e.g., `https://calendar.example.com`).

## Other Commands

```sh
npm run test:unit    # Run unit tests with Vitest
npm run type-check   # TypeScript type checking
npm run lint         # ESLint (with auto-fix)
npm run format       # Prettier
```
