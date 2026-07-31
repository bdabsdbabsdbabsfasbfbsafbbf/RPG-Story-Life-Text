import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { config } from "./config";

export const prisma = new PrismaClient();

export const redis = new Redis(config.redis.url, {
  keyPrefix: config.redis.prefix,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect: true,
});
redis.on("error", (err) => console.error("[Redis]", err.message));
