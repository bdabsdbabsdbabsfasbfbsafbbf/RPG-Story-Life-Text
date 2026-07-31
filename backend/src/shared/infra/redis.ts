import { Redis } from 'ioredis';
import { config } from '../../config';
import { logger } from '../utils/logger';

export const redisClient = new Redis(config.redis.url, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error', error);
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redisClient.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function cacheDel(key: string): Promise<void> {
  await redisClient.del(key);
}
