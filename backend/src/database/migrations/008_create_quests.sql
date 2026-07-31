-- Migration 008: Create Quests Table
CREATE TABLE IF NOT EXISTS "quests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(128) NOT NULL,
  "description" TEXT NOT NULL,
  "lore" TEXT NOT NULL,
  "type" VARCHAR(16) NOT NULL CHECK (type IN ('MAIN', 'SIDE', 'DAILY', 'CLASS', 'EVENT', 'GUILD', 'EPIC')),
  "level" INTEGER NOT NULL DEFAULT 1,
  "required_level" INTEGER NOT NULL DEFAULT 1,
  "objectives" JSONB NOT NULL DEFAULT '[]',
  "rewards" JSONB NOT NULL DEFAULT '{}',
  "prerequisites" JSONB NOT NULL DEFAULT '[]',
  "npc_id" UUID,
  "map_id" UUID,
  "is_repeatable" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_daily" BOOLEAN NOT NULL DEFAULT FALSE,
  "cooldown_hours" INTEGER NOT NULL DEFAULT 0,
  "time_limit_minutes" INTEGER NOT NULL DEFAULT 0,
  "failure_conditions" JSONB NOT NULL DEFAULT '[]',
  "dialogue_start" JSONB NOT NULL DEFAULT '[]',
  "dialogue_progress" JSONB NOT NULL DEFAULT '[]',
  "dialogue_complete" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_type ON "quests"("type");
CREATE INDEX IF NOT EXISTS idx_quests_level ON "quests"("level");
CREATE INDEX IF NOT EXISTS idx_quests_npc_id ON "quests"("npc_id");
CREATE INDEX IF NOT EXISTS idx_quests_map_id ON "quests"("map_id");

CREATE TABLE IF NOT EXISTS "character_quests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "character_id" UUID NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE,
  "quest_id" UUID NOT NULL REFERENCES "quests"("id") ON DELETE CASCADE,
  "status" VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED', 'ABANDONED')),
  "progress" JSONB NOT NULL DEFAULT '[]',
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "completed_at" TIMESTAMPTZ,
  UNIQUE("character_id", "quest_id")
);

CREATE INDEX IF NOT EXISTS idx_character_quests_character_id ON "character_quests"("character_id");
CREATE INDEX IF NOT EXISTS idx_character_quests_status ON "character_quests"("status");
