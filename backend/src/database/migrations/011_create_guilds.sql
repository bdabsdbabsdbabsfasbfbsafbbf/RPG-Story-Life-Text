-- Migration 011: Create Guilds Table
CREATE TABLE IF NOT EXISTS "guilds" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(32) NOT NULL UNIQUE,
  "tag" VARCHAR(6) NOT NULL UNIQUE,
  "description" TEXT NOT NULL DEFAULT '',
  "leader_id" UUID NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE,
  "level" INTEGER NOT NULL DEFAULT 1,
  "experience" BIGINT NOT NULL DEFAULT 0,
  "rank" INTEGER NOT NULL DEFAULT 1,
  "hall_level" INTEGER NOT NULL DEFAULT 1,
  "hall_map_id" UUID,
  "member_count" INTEGER NOT NULL DEFAULT 1,
  "max_members" INTEGER NOT NULL DEFAULT 20,
  "is_open" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guilds_name ON "guilds"("name");
CREATE INDEX IF NOT EXISTS idx_guilds_tag ON "guilds"("tag");
CREATE INDEX IF NOT EXISTS idx_guilds_leader_id ON "guilds"("leader_id");
CREATE INDEX IF NOT EXISTS idx_guilds_level ON "guilds"("level");

CREATE TABLE IF NOT EXISTS "guild_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL REFERENCES "guilds"("id") ON DELETE CASCADE,
  "character_id" UUID NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE,
  "rank" VARCHAR(16) NOT NULL DEFAULT 'MEMBER' CHECK (rank IN ('LEADER', 'OFFICER', 'VETERAN', 'MEMBER', 'RECRUIT')),
  "contribution" BIGINT NOT NULL DEFAULT 0,
  "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "last_online" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("guild_id", "character_id")
);

CREATE INDEX IF NOT EXISTS idx_guild_members_guild_id ON "guild_members"("guild_id");
CREATE INDEX IF NOT EXISTS idx_guild_members_character_id ON "guild_members"("character_id");
CREATE INDEX IF NOT EXISTS idx_guild_members_rank ON "guild_members"("rank");

CREATE TABLE IF NOT EXISTS "guild_bank" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL REFERENCES "guilds"("id") ON DELETE CASCADE UNIQUE,
  "gold" BIGINT NOT NULL DEFAULT 0,
  "items" JSONB NOT NULL DEFAULT '[]',
  "logs" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
