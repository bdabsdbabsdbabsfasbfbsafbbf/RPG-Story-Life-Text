export interface Player {
  id: string;
  username: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  diamonds: number;
  classId: string | null;
  className: string;
  rank: string;
  rankIndex: number;
  title: string;
  experience: number;
  stats: PlayerStats;
  equipment: EquipmentMap;
  activeQuests: string[];
  guildId: string | null;
  guildName: string;
  location: string;
}

export interface PlayerStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  wisdom: number;
  luck: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  critRate: number;
  critDamage: number;
  dodgeRate: number;
  hpRegen: number;
  manaRegen: number;
}

export interface PlayerClass {
  id: string;
  name: string;
  description: string;
  lore: string;
  icon: string;
  ranks: ClassRank[];
  skills: Skill[];
  baseStats: Partial<PlayerStats>;
  requirements?: ClassRequirements;
}

export interface ClassRank {
  index: number;
  name: string;
  levelRequired: number;
  description: string;
  statBonus: Partial<PlayerStats>;
}

export interface ClassRequirements {
  level: number;
  questId?: string;
  itemId?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: SkillType;
  target: SkillTarget;
  rank: number;
  levelRequired: number;
  cost: SkillCost;
  cooldown: number;
  castTime: number;
  effects: SkillEffect[];
  damageMultiplier?: number;
  healingMultiplier?: number;
  isUltimate?: boolean;
}

export type SkillType = 'physical' | 'magical' | 'healing' | 'buff' | 'debuff' | 'utility';
export type SkillTarget = 'self' | 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies';

export interface SkillCost {
  hp?: number;
  mana?: number;
  stamina?: number;
}

export interface SkillEffect {
  type: string;
  value: number;
  duration?: number;
  stat?: string;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  expReward: number;
  goldReward: number;
  lootTable: LootEntry[];
  image?: string;
  buffs: Buff[];
  debuffs: Debuff[];
}

export interface LootEntry {
  itemId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface Buff {
  id: string;
  name: string;
  icon: string;
  duration: number;
  maxDuration: number;
  stat: string;
  value: number;
  type: 'buff';
  source: string;
}

export interface Debuff {
  id: string;
  name: string;
  icon: string;
  duration: number;
  maxDuration: number;
  stat: string;
  value: number;
  type: 'debuff';
  source: string;
}

export interface CombatState {
  inCombat: boolean;
  enemy: Enemy | null;
  turn: 'player' | 'enemy';
  round: number;
  combatLog: CombatLogEntry[];
  playerBuffs: Buff[];
  playerDebuffs: Debuff[];
  enemyBuffs: Buff[];
  enemyDebuffs: Debuff[];
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'dodge' | 'crit' | 'system' | 'loot';
  source: string;
  target: string;
  value?: number;
  message: string;
  isCrit?: boolean;
  isDodge?: boolean;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  icon: string;
  quantity: number;
  stackable: boolean;
  level: number;
  description: string;
  stats?: Partial<PlayerStats>;
  sellPrice: number;
  buyPrice: number;
  isEquipped: boolean;
  requirements?: ItemRequirements;
  durability?: number;
  maxDurability?: number;
  enchantLevel?: number;
}

export type ItemType =
  | 'weapon'
  | 'helmet'
  | 'chestplate'
  | 'leggings'
  | 'boots'
  | 'shield'
  | 'ring'
  | 'amulet'
  | 'cape'
  | 'gloves'
  | 'belt'
  | 'consumable'
  | 'material'
  | 'quest_item'
  | 'key';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface ItemRequirements {
  level?: number;
  class?: string;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
}

export type EquipmentSlot =
  | 'weapon'
  | 'helmet'
  | 'chestplate'
  | 'leggings'
  | 'boots'
  | 'shield'
  | 'ring1'
  | 'ring2'
  | 'amulet'
  | 'cape'
  | 'gloves'
  | 'belt';

export type EquipmentMap = Record<EquipmentSlot, InventoryItem | null>;

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  levelRequired: number;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  isRepeatable: boolean;
  timeLimit?: number;
  location?: string;
  npcName?: string;
  dialogue?: QuestDialogue[];
}

export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'guild' | 'event';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'elite' | 'legendary';

export interface QuestObjective {
  id: string;
  type: 'kill' | 'collect' | 'talk' | 'explore' | 'craft' | 'deliver';
  target: string;
  quantity: number;
  current: number;
  description: string;
  location?: string;
}

export interface QuestRewards {
  xp: number;
  gold: number;
  items?: string[];
  reputation?: number;
  title?: string;
}

export interface QuestDialogue {
  npc: string;
  text: string;
  options?: QuestDialogueOption[];
}

export interface QuestDialogueOption {
  text: string;
  nextIndex: number;
  requirement?: string;
}

export interface ActiveQuest {
  questId: string;
  quest: Quest;
  startedAt: number;
  objectives: QuestObjective[];
  completed: boolean;
  expiredAt?: number;
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  level: number;
  xp: number;
  xpToNext: number;
  description: string;
  logo: string;
  leaderId: string;
  leaderName: string;
  members: GuildMember[];
  bank: GuildBank;
  settings: GuildSettings;
  createdAt: number;
}

export interface GuildMember {
  id: string;
  username: string;
  rank: GuildRank;
  level: number;
  className: string;
  contribution: number;
  joinedAt: number;
  lastOnline: number;
  isOnline: boolean;
}

export type GuildRank = 'leader' | 'officer' | 'veteran' | 'member' | 'recruit';

export interface GuildBank {
  gold: number;
  items: InventoryItem[];
  logs: GuildBankLog[];
}

export interface GuildBankLog {
  id: string;
  memberName: string;
  action: 'deposit' | 'withdraw';
  item?: string;
  gold?: number;
  timestamp: number;
}

export interface GuildSettings {
  isPublic: boolean;
  levelRequired: number;
  language: string;
  region: string;
}

export interface GuildQuest {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  contributedBy: Record<string, number>;
  deadline: number;
  completed: boolean;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  item: InventoryItem;
  quantity: number;
  pricePerUnit: number;
  currency: 'gold' | 'diamonds';
  listedAt: number;
  expiresAt: number;
  status: 'active' | 'sold' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  senderId: string;
  senderName: string;
  senderLevel: number;
  senderClass: string;
  senderTitle: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
  isEmote?: boolean;
  isWhisper?: boolean;
  targetId?: string;
  targetName?: string;
}

export type ChatChannel = 'global' | 'local' | 'party' | 'guild' | 'trade' | 'system' | 'whisper';

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  type: 'town' | 'dungeon' | 'boss' | 'shop' | 'quest' | 'portal';
  levelRequired: number;
  isUnlocked: boolean;
  connectedTo: string[];
  image?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; username: string; email: string } | null;
  accessToken: string | null;
  error: string | null;
}

export interface WebSocketEvent {
  event: string;
  data: unknown;
}
