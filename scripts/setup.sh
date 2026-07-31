#!/usr/bin/env bash
set -euo pipefail

echo "=== RPG Story Life - Setup Script ==="

command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Error: Docker is required but not installed."; exit 1; }

echo "[1/5] Installing backend dependencies..."
cd backend && npm install && cd ..

echo "[2/5] Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "[3/5] Installing admin dependencies..."
cd admin && npm install && cd ..

echo "[4/5] Running database migrations..."
cd backend && npx prisma migrate deploy && cd ..

echo "[5/5] Seeding database..."
cd backend && npm run seed && cd ..

echo "=== Setup complete! ==="
echo ""
echo "Run 'npm run dev' to start the development environment."
echo "Or run 'docker compose up' for Dockerized development."
