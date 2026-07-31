-- Migration 005: Create Items Table
CREATE TABLE IF NOT EXISTS "items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(64) NOT NULL,
  "description" TEXT NOT NULL,
  "type" VARCHAR(16) NOT NULL CHECK (type IN ('WEAPON', 'HELMET', 'CHESTPLATE', 'LEGGINGS', 'BOOTS', 'GLOVES', 'RING', 'AMULET', 'BELT', 'CAPE', 'ARTIFACT', 'CONSUMABLE', 'MATERIAL', 'QUEST', 'KEY', 'TOKEN')),
  "rarity" VARCHAR(16) NOT NULL DEFAULT 'COMMON' CHECK (rarity IN ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC')),
  "level" INTEGER NOT NULL DEFAULT 1,
  "tier" INTEGER NOT NULL DEFAULT 1,
  "stats" JSONB NOT NULL DEFAULT '{}',
  "requirements" JSONB NOT NULL DEFAULT '{}',
  "sell_price" INTEGER NOT NULL DEFAULT 0,
  "buy_price" INTEGER NOT NULL DEFAULT 0,
  "is_tradable" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_soulbound" BOOLEAN NOT NULL DEFAULT FALSE,
  "max_stack" INTEGER NOT NULL DEFAULT 1,
  "durability" INTEGER NOT NULL DEFAULT 100,
  "max_durability" INTEGER NOT NULL DEFAULT 100,
  "element" VARCHAR(8) NOT NULL DEFAULT 'NORMAL',
  "set_bonus_id" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_name ON "items"("name");
CREATE INDEX IF NOT EXISTS idx_items_type ON "items"("type");
CREATE INDEX IF NOT EXISTS idx_items_rarity ON "items"("rarity");
CREATE INDEX IF NOT EXISTS idx_items_level ON "items"("level");
CREATE INDEX IF NOT EXISTS idx_items_element ON "items"("element");
