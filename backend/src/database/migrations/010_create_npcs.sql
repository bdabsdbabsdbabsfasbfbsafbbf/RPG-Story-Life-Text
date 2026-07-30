-- Migration 010: Create NPCs Table
CREATE TABLE IF NOT EXISTS "npcs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(64) NOT NULL,
  "title" VARCHAR(64) NOT NULL DEFAULT '',
  "description" TEXT NOT NULL,
  "type" VARCHAR(32) NOT NULL CHECK (type IN ('MONSTER', 'BOSS', 'MERCHANT', 'QUEST_GIVER', 'TRAINER', 'BLACKSMITH', 'ENCHANTER', 'GUIDE')),
  "level" INTEGER NOT NULL DEFAULT 1,
  "max_hp" INTEGER NOT NULL DEFAULT 100,
  "max_mp" INTEGER NOT NULL DEFAULT 50,
  "stats" JSONB NOT NULL DEFAULT '{}',
  "faction" VARCHAR(32) NOT NULL DEFAULT 'neutral',
  "aggression" VARCHAR(16) NOT NULL DEFAULT 'PASSIVE' CHECK (aggression IN ('PASSIVE', 'AGGRESSIVE', 'NEUTRAL', 'FRIENDLY', 'GUARD')),
  "respawn_time" INTEGER NOT NULL DEFAULT 60,
  "experience_reward" INTEGER NOT NULL DEFAULT 0,
  "gold_drop_min" INTEGER NOT NULL DEFAULT 0,
  "gold_drop_max" INTEGER NOT NULL DEFAULT 0,
  "loot_table" JSONB NOT NULL DEFAULT '[]',
  "dialogue" JSONB NOT NULL DEFAULT '[]',
  "shop" JSONB NOT NULL DEFAULT '[]',
  "quests" JSONB NOT NULL DEFAULT '[]',
  "behavior" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_npcs_name ON "npcs"("name");
CREATE INDEX IF NOT EXISTS idx_npcs_type ON "npcs"("type");
CREATE INDEX IF NOT EXISTS idx_npcs_level ON "npcs"("level");
CREATE INDEX IF NOT EXISTS idx_npcs_faction ON "npcs"("faction");
CREATE INDEX IF NOT EXISTS idx_npcs_aggression ON "npcs"("aggression");
