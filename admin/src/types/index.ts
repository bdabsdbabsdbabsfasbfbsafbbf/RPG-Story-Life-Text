export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'gm';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface GameStats {
  onlinePlayers: number;
  totalUsers: number;
  activeGuilds: number;
  economyStats: {
    totalGold: number;
    totalItems: number;
    totalTransactions: number;
  };
  newUsers24h: number;
  peakToday: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  details: string;
}

export interface Item {
  id?: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  levelRequirement: number;
  stats: Record<string, number>;
  slots: { gems: number; runes: number };
  enchantments: string[];
  icon: string;
  effects: string[];
  passives: string[];
  sellPrice: number;
  tradeable: boolean;
}

export interface GameClass {
  id?: string;
  name: string;
  description: string;
  lore: string;
  element: string;
  difficulty: number;
  role: 'tank' | 'dps' | 'mage' | 'support' | 'assassin' | 'hybrid';
  baseStats: Record<string, number>;
  statGrowth: Record<string, number>;
  skillsPerRank: Record<number, string[]>;
  requirements: Record<string, string>;
}

export interface Skill {
  id?: string;
  name: string;
  description: string;
  type: 'active' | 'passive' | 'ultimate';
  cooldownSeconds: number;
  manaCost: number;
  staminaCost: number;
  castTime: number;
  range: number;
  targetType: 'self' | 'enemy' | 'ally' | 'aoe';
  damageFormula: string;
  buffApplication: string[];
  debuffApplication: string[];
  stackInteraction: {
    generateStacks: number;
    consumeStacks: number;
    effectsAtMaxStacks: string[];
  };
  rankUnlock: number;
  icon: string;
  animationType: string;
}

export interface Monster {
  id?: string;
  name: string;
  level: number;
  hp: number;
  mana: number;
  classId: string;
  skills: string[];
  drops: DropEntry[];
  spawnLocation: string;
  respawnTime: number;
  aggroRange: number;
  behaviorType: 'aggressive' | 'passive' | 'neutral' | 'territorial';
  isBoss: boolean;
  bossConfig?: BossConfig;
}

export interface BossConfig {
  phases: number;
  enrageTimer: number;
  mechanics: string[];
  lootTable: string;
  spawnConditions: string[];
}

export interface DropEntry {
  itemId: string;
  itemName: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface MapData {
  id?: string;
  name: string;
  description: string;
  minimumLevel: number;
  requiredQuest: string;
  connectedMaps: string[];
  npcs: string[];
  monsters: string[];
  resourceNodes: string[];
  ambientEffects: string[];
  music: string;
  background: string;
}

export interface NPC {
  id?: string;
  name: string;
  model: string;
  mapLocation: string;
  dialogueTree: DialogueNode[];
  shopInventory: string[];
  questsOffered: string[];
  behavior: string;
}

export interface DialogueNode {
  id: string;
  text: string;
  responses: DialogueResponse[];
}

export interface DialogueResponse {
  text: string;
  nextNodeId: string | null;
  action?: string;
}

export interface Quest {
  id?: string;
  name: string;
  description: string;
  type: 'main' | 'daily' | 'weekly' | 'monthly' | 'guild' | 'event' | 'boss' | 'hunting' | 'exploration';
  levelRequirement: number;
  prerequisites: string[];
  objectives: QuestObjective[];
  rewards: QuestReward;
  startDialogue: string;
  completionDialogue: string;
  chainQuest: string | null;
}

export interface QuestObjective {
  type: 'kill' | 'collect' | 'reach' | 'talk' | 'use_skill';
  target: string;
  quantity: number;
  description: string;
}

export interface QuestReward {
  xp: number;
  gold: number;
  items: { itemId: string; quantity: number }[];
  classXp: number;
  title: string;
  reputation: number;
}

export interface LootTable {
  id?: string;
  name: string;
  description: string;
  entries: LootTableEntry[];
}

export interface LootTableEntry {
  itemId: string;
  itemName: string;
  probability: number;
  minQuantity: number;
  maxQuantity: number;
  conditions: string[];
}

export interface GameEvent {
  id?: string;
  name: string;
  description: string;
  type: 'seasonal' | 'weekend' | 'boss_rush' | 'double_xp' | 'custom';
  startDate: string;
  endDate: string;
  modifiers: Record<string, number>;
  rewards: string[];
  participationRequirements: string[];
}

export interface Buff {
  id?: string;
  name: string;
  description: string;
  type: 'buff' | 'debuff';
  maxStacks: number;
  duration: number;
  stackDuration: number;
  effectsPerStack: Record<string, number>;
  effectsAtMaxStacks: Record<string, number>;
  conditions: {
    generate: string[];
    consume: string[];
  };
  visualEffect: string;
}

export interface CraftingRecipe {
  id?: string;
  resultItem: string;
  resultItemName: string;
  resultQuantity: number;
  requiredItems: { itemId: string; itemName: string; quantity: number }[];
  requiredLevel: number;
  requiredStation: string;
  craftingTime: number;
  xpReward: number;
}

export interface Title {
  id?: string;
  name: string;
  description: string;
  statsBonus: Record<string, number>;
  howToObtain: string;
  displayFormat: string;
}

export interface Achievement {
  id?: string;
  name: string;
  description: string;
  category: string;
  requirements: Record<string, any>;
  rewards: {
    title: string;
    item: string;
    mount: string;
    gold: number;
    xp: number;
  };
}

export interface Player {
  id: string;
  username: string;
  level: number;
  class: string;
  guild: string;
  status: 'online' | 'offline' | 'banned';
  lastLogin: string;
  playTime: number;
  gold: number;
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  leader: string;
  members: number;
  level: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface SystemConfig {
  xpRate: number;
  goldRate: number;
  dropRate: number;
  levelCap: number;
  serverMessage: string;
  maintenanceMode: boolean;
  currentSeason: string;
  seasonEnd: string;
  battlePassActive: boolean;
  battlePassEnd: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
}
