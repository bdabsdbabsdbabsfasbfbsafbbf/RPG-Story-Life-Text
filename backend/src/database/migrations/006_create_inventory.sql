-- Migration 006: Create Inventory Table
CREATE TABLE IF NOT EXISTS "inventory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "character_id" UUID NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE,
  "item_id" UUID NOT NULL REFERENCES "items"("id") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "slot_index" INTEGER NOT NULL,
  "durability" INTEGER,
  "is_equipped" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("character_id", "slot_index")
);

CREATE INDEX IF NOT EXISTS idx_inventory_character_id ON "inventory"("character_id");
CREATE INDEX IF NOT EXISTS idx_inventory_item_id ON "inventory"("item_id");
CREATE INDEX IF NOT EXISTS idx_inventory_character_slot ON "inventory"("character_id", "slot_index");
