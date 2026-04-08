# Parfumbox development

## Prerequisites

- Node.js 20+
- npm (workspaces at repo root)

## Install and run

From the repository root:

```bash
npm install
```

**API** (from repo root or `apps/api`):

```bash
cp .env.example apps/api/.env
# Edit apps/api/.env: set TELEGRAM_BOT_TOKEN and JWT_SECRET for real Telegram auth
npm run dev:api
```

**Web** (Telegram Mini App UI):

```bash
cp .env.example apps/web/.env.local
# Optional: VITE_API_URL=https://your-api.example.com (empty in dev uses Vite proxy to /api)
npm run dev:web
```

The Vite dev server proxies `/api` to `http://localhost:3000` (see `apps/web/vite.config.ts`).

**Admin dashboard** (Ant Design, staff UI):

```bash
# Set ADMIN_API_KEY in the repo root `.env` or in `apps/api/.env` (the latter overrides). Include `http://localhost:5174` in `CORS_ORIGIN`.
npm run dev:api
npm run dev:admin
```

Open `http://localhost:5174`, sign in with the same `ADMIN_API_KEY` value. The admin app proxies `/api` like the mini app (see `apps/admin/vite.config.ts`).

**Product images:** staff upload images on the Products screen (`POST /api/admin/upload`).

- **MinIO (recommended):** set `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, and optionally `MINIO_BUCKET` / `MINIO_PUBLIC_URL` in `.env`. The API creates the bucket if missing and stores objects under `uploads/…`. Example local MinIO:

  ```bash
  docker run -p 9000:9000 -p 9001:9001 \
    -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
    quay.io/minio/minio server /data --console-address ":9001"
  ```

  Then set `MINIO_ENDPOINT=http://127.0.0.1:9000`, `MINIO_ACCESS_KEY=minioadmin`, `MINIO_SECRET_KEY=minioadmin`. For objects to load in the browser you may need a **public bucket policy** or a reverse proxy; `MINIO_PUBLIC_URL` can point at a CDN or the MinIO API base including bucket.

- **Local disk (no MinIO):** omit `MINIO_ENDPOINT`. Files go to `apps/api/uploads/` and are served at `GET /uploads/:filename`. Set `PUBLIC_BASE_URL` so returned URLs match your public API host in production.

## Telegram Mini App URL (HTTPS)

Telegram requires an **HTTPS** URL for the Mini App.

1. Create a bot with [@BotFather](https://t.me/BotFather), copy the **bot token** into `apps/api/.env` as `TELEGRAM_BOT_TOKEN`.
2. In BotFather, set the Mini App URL to your **public HTTPS** origin (for example a tunnel or production host) pointing at the built web app (e.g. `https://xxxx.ngrok-free.app`).
3. Use a tunnel in development, for example:
   - [ngrok](https://ngrok.com/): `ngrok http 5173` (or your Vite port)
   - [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

Point the tunnel at the same host/port where `npm run dev:web` is listening, then paste the HTTPS URL into BotFather as the Mini App link.

## Dev-only auth (browser without Telegram)

For local UI testing **without** opening the app inside Telegram:

1. In `apps/api/.env`, set `AUTH_DEV_BYPASS=true` and **never** enable this in production.
2. The API exposes `POST /api/auth/dev` with optional header `X-Dev-Telegram-Id` (defaults to `123456789`). The web app, in **development** mode, calls this when there is no `initData` so you can browse the catalog and place orders.
3. In production builds (`npm run build` for web), dev login is **not** used automatically; users must open the Mini App inside Telegram so `initData` is present.

## Database

SQLite file (default): `apps/api/prisma/dev.db` when `DATABASE_URL=file:./dev.db`.

```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

For PostgreSQL, set `DATABASE_URL` to a Postgres URL in `apps/api/.env` and run migrations again.

## Security checklist

- Keep `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, and `ADMIN_API_KEY` secret; never commit real `.env` files.
- Set `AUTH_DEV_BYPASS=false` in production and use a real `TELEGRAM_BOT_TOKEN`.
- Reject stale `initData` using `TELEGRAM_AUTH_MAX_AGE_SECONDS` (validated on the server).
- Restrict who can reach the admin UI in production (VPN, IP allowlist, or private hostname); staff JWTs are still bearer tokens.
