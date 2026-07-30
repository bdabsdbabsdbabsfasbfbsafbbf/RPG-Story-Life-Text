# Deploy Guide

## Railway

1. Push code to GitHub
2. Connect to Railway
3. Add PostgreSQL plugin
4. Add Redis plugin
5. Set environment variables:
```
DATABASE_URL=<railway-postgres-url>
REDIS_URL=<railway-redis-url>
JWT_SECRET=<generate-secure-key>
DISCORD_CLIENT_ID=<discord-app-id>
DISCORD_CLIENT_SECRET=<discord-app-secret>
DISCORD_REDIRECT_URI=https://<your-app>.railway.app/api/auth/discord/callback
FRONTEND_URL=https://<your-app>.railway.app
ADMIN_URL=https://<your-app>.railway.app/admin
NODE_ENV=production
```
6. Deploy - Railway will build using `railway.json`

## Docker (Local Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Manual (VPS)

```bash
# Install PostgreSQL 16, Redis 7, Node.js 20

# Clone and build
git clone <repo> && cd "RPG Story Life"
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# Setup database
cd ../backend
npx prisma migrate deploy
npm run seed

# Start with PM2
npm i -g pm2
pm2 start dist/server.js --name rpg-backend
pm2 serve ../frontend/dist 5173 --name rpg-frontend
```
