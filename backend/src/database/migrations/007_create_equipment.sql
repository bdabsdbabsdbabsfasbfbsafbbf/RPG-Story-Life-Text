-- Migration 007: Create Equipment Table
CREATE TABLE IF NOT EXISTS "equipment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "character_id" UUID NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE UNIQUE,
  "weapon_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "helmet_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "chestplate_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "leggings_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "boots_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "gloves_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "ring_1_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "ring_2_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "amulet_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "belt_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "cape_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "artifact_id" UUID REFERENCES "items"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_character_id ON "equipment"("character_id");
