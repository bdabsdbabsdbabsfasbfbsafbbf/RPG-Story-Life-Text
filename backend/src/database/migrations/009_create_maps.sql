-- Migration 009: Create Maps Table
CREATE TABLE IF NOT EXISTS "maps" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(64) NOT NULL,
  "description" TEXT NOT NULL,
  "lore" TEXT NOT NULL DEFAULT '',
  "width" INTEGER NOT NULL DEFAULT 100,
  "height" INTEGER NOT NULL DEFAULT 100,
  "type" VARCHAR(32) NOT NULL CHECK (type IN ('OVERWORLD', 'DUNGEON', 'RAID', 'TOWN', 'DUNGEON_ENTRANCE', 'ARENA', 'BOSS_ARENA')),
  "danger_level" INTEGER NOT NULL DEFAULT 1,
  "required_level" INTEGER NOT NULL DEFAULT 1,
  "recommended_level" INTEGER NOT NULL DEFAULT 1,
  "is_instance" BOOLEAN NOT NULL DEFAULT FALSE,
  "max_players" INTEGER NOT NULL DEFAULT 0,
  "connections" JSONB NOT NULL DEFAULT '[]',
  "resources" JSONB NOT NULL DEFAULT '[]',
  "spawn_points" JSONB NOT NULL DEFAULT '[]',
  "music" VARCHAR(128) NOT NULL DEFAULT '',
  "ambient" VARCHAR(128) NOT NULL DEFAULT '',
  "weather" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maps_name ON "maps"("name");
CREATE INDEX IF NOT EXISTS idx_maps_type ON "maps"("type");
CREATE INDEX IF NOT EXISTS idx_maps_level ON "maps"("recommended_level");
