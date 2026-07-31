-- Migration 001: Create Users Table
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "discord_id" VARCHAR(64) UNIQUE,
  "username" VARCHAR(32) NOT NULL UNIQUE,
  "discriminator" VARCHAR(4) NOT NULL DEFAULT '0000',
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255),
  "avatar" VARCHAR(512),
  "access_token" TEXT,
  "refresh_token" TEXT,
  "last_login" TIMESTAMPTZ,
  "is_banned" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_premium" BOOLEAN NOT NULL DEFAULT FALSE,
  "premium_until" TIMESTAMPTZ,
  "is_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "player_name" VARCHAR(24),
  "settings" JSONB NOT NULL DEFAULT '{}',
  "roles" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_discord_id ON "users"("discord_id");
CREATE INDEX IF NOT EXISTS idx_users_email ON "users"("email");
CREATE INDEX IF NOT EXISTS idx_users_username ON "users"("username");
CREATE INDEX IF NOT EXISTS idx_users_created_at ON "users"("created_at");
