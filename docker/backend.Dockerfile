FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm ci

COPY src ./src
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --production --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/index.js"]
