-- Migration 002: Create Characters Table
CREATE TABLE IF NOT EXISTS "characters" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(32) NOT NULL UNIQUE,
  "level" INTEGER NOT NULL DEFAULT 1,
  "experience" BIGINT NOT NULL DEFAULT 0,
  "experience_to_next" BIGINT NOT NULL DEFAULT 100,
  "stat_points" INTEGER NOT NULL DEFAULT 5,
  "class_id" UUID,
  "class_name" VARCHAR(32) NOT NULL DEFAULT 'Novice',
  "hp" INTEGER NOT NULL DEFAULT 100,
  "max_hp" INTEGER NOT NULL DEFAULT 100,
  "mp" INTEGER NOT NULL DEFAULT 50,
  "max_mp" INTEGER NOT NULL DEFAULT 50,
  "strength" INTEGER NOT NULL DEFAULT 5,
  "dexterity" INTEGER NOT NULL DEFAULT 5,
  "intelligence" INTEGER NOT NULL DEFAULT 5,
  "vitality" INTEGER NOT NULL DEFAULT 5,
  "wisdom" INTEGER NOT NULL DEFAULT 5,
  "agility" INTEGER NOT NULL DEFAULT 5,
  "gold" BIGINT NOT NULL DEFAULT 0,
  "map_id" UUID,
  "x" INTEGER NOT NULL DEFAULT 0,
  "y" INTEGER NOT NULL DEFAULT 0,
  "is_online" BOOLEAN NOT NULL DEFAULT FALSE,
  "title" VARCHAR(64),
  "reputation" JSONB NOT NULL DEFAULT '{}',
  "active_quests" JSONB NOT NULL DEFAULT '[]',
  "completed_quests" JSONB NOT NULL DEFAULT '[]',
  "learned_skills" JSONB NOT NULL DEFAULT '[]',
  "equipped_skills" JSONB NOT NULL DEFAULT '[]',
  "total_play_time" BIGINT NOT NULL DEFAULT 0,
  "deaths" INTEGER NOT NULL DEFAULT 0,
  "kills" INTEGER NOT NULL DEFAULT 0,
  "last_activity" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characters_user_id ON "characters"("user_id");
CREATE INDEX IF NOT EXISTS idx_characters_name ON "characters"("name");
CREATE INDEX IF NOT EXISTS idx_characters_level ON "characters"("level");
CREATE INDEX IF NOT EXISTS idx_characters_map_id ON "characters"("map_id");
CREATE INDEX IF NOT EXISTS idx_characters_class_id ON "characters"("class_id");
