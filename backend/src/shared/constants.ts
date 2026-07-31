export const XP_TABLE: number[] = (() => {
  const table: number[] = [0];
  for (let i = 1; i <= 100; i++) {
    table.push(Math.floor(100 * Math.pow(i, 1.5) + 50 * i));
  }
  return table;
})();

export const LEVEL_THRESHOLDS = {
  MAX_LEVEL: 100,
  STARTING_LEVEL: 1,
  STARTING_XP: 0,
};

export const XP_MULTIPLIERS = {
  NORMAL: 1.0,
  ELITE: 1.5,
  BOSS: 3.0,
  PARTY_BONUS_PER_MEMBER: 0.1,
  PREMIUM: 1.5,
  EVENT: 2.0,
};

export const STAT_CAPS = {
  MAX_HP: 99999,
  MAX_MP: 99999,
  MAX_STAT: 999,
  MIN_STAT: 1,
  MAX_SPEED: 500,
  MAX_CRIT_RATE: 0.95,
  MAX_CRIT_DAMAGE: 5.0,
  MAX_DODGE: 0.8,
  MAX_BLOCK: 0.8,
  MAX_RESISTANCE: 0.9,
};

export const BASE_STATS = {
  HP: 100,
  MP: 50,
  STRENGTH: 5,
  DEXTERITY: 5,
  INTELLIGENCE: 5,
  VITALITY: 5,
  WISDOM: 5,
  AGILITY: 5,
};

export const STAT_GROWTH_PER_LEVEL = {
  HP: 20,
  MP: 10,
  STRENGTH: 1,
  DEXTERITY: 1,
  INTELLIGENCE: 1,
  VITALITY: 1,
  WISDOM: 1,
  AGILITY: 1,
};

export const STAT_POINTS_PER_LEVEL = 5;

export const COMBAT_CONSTANTS = {
  BASE_DAMAGE: 10,
  DAMAGE_VARIANCE: 0.1,
  CRIT_MULTIPLIER: 2.0,
  DODGE_MULTIPLIER: 1.0,
  BLOCK_REDUCTION: 0.5,
  XP_RADIUS: 50,
  AGGRO_RANGE: 20,
  LEASH_RANGE: 30,
  COMBAT_TIMEOUT: 30,
  TICK_RATE: 1000,
};

export const REGENERATION_RATES = {
  HP_PER_TICK: 0.05,
  MP_PER_TICK: 0.03,
  TICK_INTERVAL: 5000,
};

export const INVENTORY_CONSTANTS = {
  MAX_SLOTS: 64,
  MAX_STACK_SIZE: 999,
  MAX_GOLD: 999999999,
};

export const CLASS_CONSTANTS = {
  BASE_CLASS_LEVEL: 1,
  MAX_CLASS_LEVEL: 50,
  SKILLS_PER_CLASS: 8,
  SKILL_SLOTS: 6,
};

export const GUILD_CONSTANTS = {
  MIN_MEMBERS: 5,
  MAX_MEMBERS: 100,
  CREATION_COST: 10000,
  MIN_LEVEL: 20,
  MAX_RANK: 10,
};

export const QUEST_CONSTANTS = {
  MAX_ACTIVE_QUESTS: 20,
  MAX_DAILY_QUESTS: 5,
  QUEST_SHARE_RADIUS: 30,
};

export const MARKET_CONSTANTS = {
  LISTING_FEE: 0.05,
  MAX_LISTINGS_PER_USER: 50,
  LISTING_DURATION_HOURS: 168,
  TAX_RATE: 0.1,
};

export const CHAT_CONSTANTS = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_WHISPER_LENGTH: 300,
  MESSAGE_COOLDOWN: 1000,
  SHOUT_COOLDOWN: 5000,
  MAX_CHANNELS: 10,
  CHANNEL_TYPES: ['global', 'world', 'trade', 'party', 'guild', 'whisper', 'system'] as const,
};

export const TIME_CONSTANTS = {
  DAY_DURATION_MS: 24 * 60 * 60 * 1000,
  WEEK_DURATION_MS: 7 * 24 * 60 * 60 * 1000,
  MONTH_DURATION_MS: 30 * 24 * 60 * 60 * 1000,
  RESPAWN_TIME_MS: 5000,
  NPC_RESPAWN_MS: 60000,
  ITEM_DECAY_MS: 300000,
};

export const RARITY_COLORS = {
  COMMON: '#ffffff',
  UNCOMMON: '#1eff00',
  RARE: '#0070dd',
  EPIC: '#a335ee',
  LEGENDARY: '#ff8000',
  MYTHIC: '#e6cc80',
} as const;

export const RARITY_MULTIPLIERS = {
  COMMON: 1.0,
  UNCOMMON: 1.25,
  RARE: 1.5,
  EPIC: 2.0,
  LEGENDARY: 3.0,
  MYTHIC: 5.0,
} as const;

export const ELEMENT_TYPES = [
  'NORMAL',
  'FIRE',
  'WATER',
  'EARTH',
  'WIND',
  'LIGHT',
  'DARK',
  'ARCANE',
] as const;

export const ELEMENT_ADVANTAGE: Record<string, Record<string, number>> = {
  FIRE: { WATER: 0.5, EARTH: 1.5, WIND: 1.0, LIGHT: 1.0, DARK: 1.0 },
  WATER: { FIRE: 1.5, EARTH: 0.5, WIND: 1.0, LIGHT: 1.0, DARK: 1.0 },
  EARTH: { FIRE: 0.5, WATER: 1.5, WIND: 1.0, LIGHT: 1.0, DARK: 1.0 },
  WIND: { FIRE: 1.0, WATER: 1.0, EARTH: 1.5, LIGHT: 0.5, DARK: 1.0 },
  LIGHT: { DARK: 2.0, FIRE: 1.0, WATER: 1.0, EARTH: 1.0, WIND: 1.0 },
  DARK: { LIGHT: 0.5, FIRE: 1.0, WATER: 1.0, EARTH: 1.0, WIND: 1.0 },
  ARCANE: { FIRE: 1.25, WATER: 1.25, EARTH: 1.25, WIND: 1.25, LIGHT: 1.25, DARK: 1.25 },
};
