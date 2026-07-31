import Redis from 'ioredis';
import { config } from '../../../config';

export class RedisClient {
  private static instance: Redis;
  private static subInstance: Redis;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
      });
    }
    return RedisClient.instance;
  }

  static getSubscriber(): Redis {
    if (!RedisClient.subInstance) {
      RedisClient.subInstance = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    }
    return RedisClient.subInstance;
  }

  static async connect(): Promise<void> {
    const redis = RedisClient.getInstance();
    const sub = RedisClient.getSubscriber();
    await Promise.all([redis.connect(), sub.connect()]);
    console.log('Redis connected successfully');
  }

  static async disconnect(): Promise<void> {
    await Promise.all([
      RedisClient.getInstance().quit(),
      RedisClient.getSubscriber().quit(),
    ]);
    console.log('Redis disconnected');
  }

  static async get(key: string): Promise<string | null> {
    return RedisClient.getInstance().get(key);
  }

  static async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return RedisClient.getInstance().setex(key, ttl, value);
    }
    return RedisClient.getInstance().set(key, value);
  }

  static async del(key: string): Promise<number> {
    return RedisClient.getInstance().del(key);
  }

  static async keys(pattern: string): Promise<string[]> {
    return RedisClient.getInstance().keys(pattern);
  }

  static async hget(key: string, field: string): Promise<string | null> {
    return RedisClient.getInstance().hget(key, field);
  }

  static async hset(key: string, field: string, value: string): Promise<number> {
    return RedisClient.getInstance().hset(key, field, value);
  }

  static async hgetall(key: string): Promise<Record<string, string>> {
    return RedisClient.getInstance().hgetall(key);
  }

  static async publish(channel: string, message: string): Promise<number> {
    return RedisClient.getInstance().publish(channel, message);
  }

  static async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    const sub = RedisClient.getSubscriber();
    await sub.subscribe(channel);
    sub.on('message', (ch, message) => {
      if (ch === channel) handler(message);
    });
  }
}
