-- Migration 003: Create Classes Table
CREATE TABLE IF NOT EXISTS "classes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(32) NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "lore" TEXT NOT NULL,
  "role" VARCHAR(16) NOT NULL CHECK (role IN ('TANK', 'DAMAGE', 'HEALER', 'SUPPORT', 'BALANCED')),
  "primary_stat" VARCHAR(16) NOT NULL,
  "hp_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  "mp_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  "base_stats" JSONB NOT NULL DEFAULT '{}',
  "stat_growth" JSONB NOT NULL DEFAULT '{}',
  "rank" INTEGER NOT NULL DEFAULT 1,
  "rank_name" VARCHAR(32) NOT NULL,
  "requirements" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_name ON "classes"("name");
CREATE INDEX IF NOT EXISTS idx_classes_role ON "classes"("role");
CREATE INDEX IF NOT EXISTS idx_classes_rank ON "classes"("rank");
