-- RPG Story Life - Initial Database Schema
-- PostgreSQL Migration

BEGIN;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id VARCHAR(255) UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  avatar TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'player',
  gold BIGINT NOT NULL DEFAULT 0,
  diamonds BIGINT NOT NULL DEFAULT 0,
  total_play_time BIGINT NOT NULL DEFAULT 0,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience BIGINT NOT NULL DEFAULT 0,
  experience_to_next BIGINT NOT NULL DEFAULT 100,
  max_hp INTEGER NOT NULL DEFAULT 100,
  current_hp INTEGER NOT NULL DEFAULT 100,
  max_mana INTEGER NOT NULL DEFAULT 50,
  current_mana INTEGER NOT NULL DEFAULT 50,
  max_stamina INTEGER NOT NULL DEFAULT 100,
  current_stamina INTEGER NOT NULL DEFAULT 100,
  rank INTEGER NOT NULL DEFAULT 0,
  title VARCHAR(100) DEFAULT '',
  map_id INTEGER NOT NULL DEFAULT 1,
  location VARCHAR(100) NOT NULL DEFAULT 'Spawn',
  guild_id UUID,
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  pvp_wins INTEGER NOT NULL DEFAULT 0,
  pvp_losses INTEGER NOT NULL DEFAULT 0,
  active_class_id UUID,
  unlocked_classes JSONB DEFAULT '[]',
  in_combat BOOLEAN NOT NULL DEFAULT false,
  combat_target_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  lore TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'dps',
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
  element VARCHAR(20) NOT NULL DEFAULT 'neutral',
  requirements JSONB,
  is_starter BOOLEAN NOT NULL DEFAULT false,
  max_rank INTEGER NOT NULL DEFAULT 10,
  core_stats JSONB NOT NULL DEFAULT '{}',
  modifier_stats JSONB NOT NULL DEFAULT '{}',
  combat_stats JSONB NOT NULL DEFAULT '{}',
  scaling JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'active',
  target VARCHAR(20) NOT NULL DEFAULT 'enemy',
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  rank_required INTEGER NOT NULL DEFAULT 0,
  mana_cost INTEGER NOT NULL DEFAULT 0,
  stamina_cost INTEGER NOT NULL DEFAULT 0,
  cooldown INTEGER NOT NULL DEFAULT 0,
  cast_time INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  range INTEGER NOT NULL DEFAULT 0,
  damage JSONB,
  healing JSONB,
  buffs JSONB,
  debuffs JSONB,
  stack_effects JSONB,
  conditions JSONB,
  is_passive BOOLEAN NOT NULL DEFAULT false,
  combo_links JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  slot VARCHAR(20) NOT NULL,
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  level INTEGER NOT NULL DEFAULT 1,
  required_level INTEGER NOT NULL DEFAULT 1,
  stats JSONB NOT NULL DEFAULT '{}',
  enchantments JSONB,
  gems JSONB,
  runes JSONB,
  buffs JSONB,
  passives JSONB,
  special_effects JSONB,
  tradeable BOOLEAN NOT NULL DEFAULT true,
  sell_price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  slot VARCHAR(20),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  custom_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Guilds table
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  tag VARCHAR(10),
  description TEXT,
  logo_url TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  experience BIGINT NOT NULL DEFAULT 0,
  gold BIGINT NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 1,
  max_members INTEGER NOT NULL DEFAULT 50,
  perks JSONB NOT NULL DEFAULT '{}',
  bank JSONB,
  rank INTEGER NOT NULL DEFAULT 0,
  total_contribution BIGINT NOT NULL DEFAULT 0,
  owner_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Guild members table
CREATE TABLE IF NOT EXISTS guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  contribution BIGINT NOT NULL DEFAULT 0,
  donated_gold BIGINT NOT NULL DEFAULT 0,
  quests_completed INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

-- Market listings table
CREATE TABLE IF NOT EXISTS market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID,
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  listing_type VARCHAR(10) NOT NULL DEFAULT 'sell',
  status VARCHAR(10) NOT NULL DEFAULT 'active',
  price BIGINT NOT NULL DEFAULT 0,
  buyout_price BIGINT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(20) NOT NULL DEFAULT 'story',
  difficulty VARCHAR(20) NOT NULL DEFAULT 'easy',
  required_level INTEGER NOT NULL DEFAULT 1,
  objectives JSONB NOT NULL,
  rewards JSONB NOT NULL,
  requirements JSONB,
  map_id UUID,
  npc_id UUID,
  is_repeatable BOOLEAN NOT NULL DEFAULT false,
  cooldown_minutes INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Quest progress table
CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id),
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  progress JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMP,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Maps table
CREATE TABLE IF NOT EXISTS maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  background_url TEXT,
  thumbnail_url TEXT,
  required_level INTEGER NOT NULL DEFAULT 1,
  required_rank INTEGER NOT NULL DEFAULT 0,
  teleports JSONB,
  npcs JSONB,
  monsters JSONB,
  bosses JSONB,
  shops JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- NPCs table
CREATE TABLE IF NOT EXISTS npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  dialogue TEXT NOT NULL,
  npc_type VARCHAR(20) NOT NULL DEFAULT 'story',
  avatar_url TEXT,
  options JSONB,
  shop_items JSONB,
  quests JSONB,
  map_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Buffs table
CREATE TABLE IF NOT EXISTS buffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  is_debuff BOOLEAN NOT NULL DEFAULT false,
  type VARCHAR(50) NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  max_stacks INTEGER NOT NULL DEFAULT 1,
  is_stackable BOOLEAN NOT NULL DEFAULT false,
  stack_effects JSONB,
  conditions JSONB,
  tick_interval INTEGER NOT NULL DEFAULT 0,
  tick_damage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Stacks table
CREATE TABLE IF NOT EXISTS stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  source_skill_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  target_id VARCHAR(255),
  current_stacks INTEGER NOT NULL DEFAULT 0,
  max_stacks INTEGER NOT NULL DEFAULT 10,
  effects JSONB,
  expires_at TIMESTAMP,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Combat logs table
CREATE TABLE IF NOT EXISTS combat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  target_id VARCHAR(255),
  target_name VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  damage INTEGER NOT NULL DEFAULT 0,
  healing INTEGER NOT NULL DEFAULT 0,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  is_dodged BOOLEAN NOT NULL DEFAULT false,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  effects JSONB,
  is_pvp BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'global',
  content TEXT NOT NULL,
  recipient_id UUID,
  is_system BOOLEAN NOT NULL DEFAULT false,
  guild_id UUID,
  party_id VARCHAR(255),
  map_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  event_type VARCHAR(20) NOT NULL DEFAULT 'seasonal',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  rewards JSONB,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_guild_id ON characters(guild_id);
CREATE INDEX idx_skills_class_id ON skills(class_id);
CREATE INDEX idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX idx_inventory_equipped ON inventory_items(user_id, is_equipped);
CREATE INDEX idx_guild_members_guild_id ON guild_members(guild_id);
CREATE INDEX idx_guild_members_user_id ON guild_members(user_id);
CREATE INDEX idx_market_listings_status ON market_listings(status);
CREATE INDEX idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX idx_quest_progress_user_id ON quest_progress(user_id);
CREATE INDEX idx_quest_progress_status ON quest_progress(status);
CREATE INDEX idx_combat_logs_attacker ON combat_logs(attacker_id);
CREATE INDEX idx_chat_messages_channel ON chat_messages(channel);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

COMMIT;
