#!/bin/sh
set -e
cd /app/apps/api
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm exec prisma db seed || true
exec node dist/main.js
