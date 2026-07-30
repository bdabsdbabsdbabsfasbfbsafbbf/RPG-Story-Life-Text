import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rpg_story_life',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    callbackUrl: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/discord/callback',
  },
  
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@rpgstorylife.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  
  game: {
    baseXpRate: parseFloat(process.env.BASE_XP_RATE || '1.0'),
    baseDropRate: parseFloat(process.env.BASE_DROP_RATE || '1.0'),
    baseGoldRate: parseFloat(process.env.BASE_GOLD_RATE || '1.0'),
    maxLevel: parseInt(process.env.MAX_LEVEL || '150', 10),
    combatTickRate: parseInt(process.env.COMBAT_TICK_RATE || '1000', 10),
  },
} as const;

export type Config = typeof config;
