#!/bin/sh
set -e

echo "Waiting for database..."
# Apply schema (creates tables if migrations are absent) then seed.
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss
node prisma/seed.js || echo "Seed skipped/failed (continuing)"

exec "$@"
