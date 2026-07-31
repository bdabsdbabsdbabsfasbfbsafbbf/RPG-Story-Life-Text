#!/usr/bin/env bash
set -euo pipefail

echo "=== RPG Story Life - Database Reset ==="

cd "$(dirname "$0")/../backend"

echo "[1/4] Dropping database..."
npx prisma migrate reset --force

echo "[2/4] Running migrations..."
npx prisma migrate deploy

echo "[3/4] Generating Prisma client..."
npx prisma generate

echo "[4/4] Seeding database..."
npm run seed

echo "=== Database reset complete! ==="
