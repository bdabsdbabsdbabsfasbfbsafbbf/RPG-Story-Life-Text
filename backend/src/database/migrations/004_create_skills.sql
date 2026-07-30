-- Migration 004: Create Skills Table
CREATE TABLE IF NOT EXISTS "skills" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(48) NOT NULL,
  "description" TEXT NOT NULL,
  "class_id" UUID REFERENCES "classes"("id") ON DELETE CASCADE,
  "level_required" INTEGER NOT NULL DEFAULT 1,
  "type" VARCHAR(16) NOT NULL CHECK (type IN ('ACTIVE', 'PASSIVE', 'ULTIMATE', 'AUTO_ATTACK')),
  "target_type" VARCHAR(16) NOT NULL CHECK (target_type IN ('SELF', 'SINGLE_ENEMY', 'ALL_ENEMIES', 'SINGLE_ALLY', 'ALL_ALLIES', 'AREA')),
  "element" VARCHAR(8) NOT NULL DEFAULT 'NORMAL' CHECK (element IN ('NORMAL', 'FIRE', 'WATER', 'EARTH', 'WIND', 'LIGHT', 'DARK', 'ARCANE')),
  "mana_cost" INTEGER NOT NULL DEFAULT 10,
  "cooldown" DECIMAL(6,2) NOT NULL DEFAULT 1.00,
  "cast_time" DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  "range" DECIMAL(6,2) NOT NULL DEFAULT 5.00,
  "aoe_radius" DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  "damage_multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  "healing_multiplier" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  "buff_duration" DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  "buff_value" DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  "effects" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_class_id ON "skills"("class_id");
CREATE INDEX IF NOT EXISTS idx_skills_type ON "skills"("type");
CREATE INDEX IF NOT EXISTS idx_skills_element ON "skills"("element");
