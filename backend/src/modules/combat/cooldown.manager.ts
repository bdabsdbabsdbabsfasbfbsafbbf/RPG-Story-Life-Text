import Redis from "ioredis";

interface CooldownEntry {
  skillId: string;
  remainingMs: number;
  totalMs: number;
  expiresAt: number;
}

export class CooldownManager {
  constructor(private redis: Redis) {}

  private key(characterId: string): string {
    return `cooldowns:${characterId}`;
  }

  async setCooldown(characterId: string, skillId: string, durationMs: number): Promise<void> {
    const entry: CooldownEntry = {
      skillId,
      remainingMs: durationMs,
      totalMs: durationMs,
      expiresAt: Date.now() + durationMs,
    };
    await this.redis.hset(this.key(characterId), skillId, JSON.stringify(entry));
    await this.redis.expire(this.key(characterId), Math.ceil(durationMs / 1000) + 10);
  }

  async getCooldown(characterId: string, skillId: string): Promise<CooldownEntry | null> {
    const data = await this.redis.hget(this.key(characterId), skillId);
    if (!data) return null;
    const entry: CooldownEntry = JSON.parse(data);
    const now = Date.now();
    if (now >= entry.expiresAt) {
      await this.redis.hdel(this.key(characterId), skillId);
      return null;
    }
    entry.remainingMs = entry.expiresAt - now;
    return entry;
  }

  async getAllCooldowns(characterId: string): Promise<CooldownEntry[]> {
    const data = await this.redis.hgetall(this.key(characterId));
    const result: CooldownEntry[] = [];
    const now = Date.now();
    for (const [, value] of Object.entries(data)) {
      const entry: CooldownEntry = JSON.parse(value);
      if (now < entry.expiresAt) {
        entry.remainingMs = entry.expiresAt - now;
        result.push(entry);
      }
    }
    return result;
  }

  async isOnCooldown(characterId: string, skillId: string): Promise<boolean> {
    const entry = await this.getCooldown(characterId, skillId);
    return entry !== null && entry.remainingMs > 0;
  }

  async clearCooldown(characterId: string, skillId: string): Promise<void> {
    await this.redis.hdel(this.key(characterId), skillId);
  }

  async clearAllCooldowns(characterId: string): Promise<void> {
    await this.redis.del(this.key(characterId));
  }
}
