-- Migration 012: Create Market Table
CREATE TABLE IF NOT EXISTS "market_listings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "seller_id" UUID NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE,
  "seller_name" VARCHAR(32) NOT NULL,
  "item_id" UUID NOT NULL REFERENCES "items"("id") ON DELETE CASCADE,
  "item_name" VARCHAR(64) NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "price_per_unit" INTEGER NOT NULL,
  "total_price" INTEGER NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED')),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMPTZ NOT NULL,
  "sold_at" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_market_listings_seller_id ON "market_listings"("seller_id");
CREATE INDEX IF NOT EXISTS idx_market_listings_item_id ON "market_listings"("item_id");
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON "market_listings"("status");
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON "market_listings"("created_at");

CREATE TABLE IF NOT EXISTS "market_history" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "item_id" UUID NOT NULL REFERENCES "items"("id") ON DELETE CASCADE,
  "item_name" VARCHAR(64) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price_per_unit" INTEGER NOT NULL,
  "total_price" INTEGER NOT NULL,
  "buyer_id" UUID NOT NULL,
  "seller_id" UUID NOT NULL,
  "sold_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_history_item_id ON "market_history"("item_id");
CREATE INDEX IF NOT EXISTS idx_market_history_sold_at ON "market_history"("sold_at");
