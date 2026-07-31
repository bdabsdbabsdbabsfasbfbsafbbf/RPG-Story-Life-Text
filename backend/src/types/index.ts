export interface IUser {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  email: string;
  avatar: string | null;
  accessToken: string;
  refreshToken: string;
  lastLogin: Date;
  isBanned: boolean;
  isPremium: boolean;
  premiumUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICharacter {
  id: string;
  userId: string;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  statPoints: number;
  classId: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  wisdom: number;
  agility: number;
  gold: number;
  mapId: string;
  x: number;
  y: number;
  isOnline: boolean;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICombatState {
  characterId: string;
  targetId: string;
  isInCombat: boolean;
  turnTimer: number;
  comboCount: number;
  lastActionTime: Date;
  blocksRemaining: number;
  activeBuffs: IBuff[];
  activeDebuffs: IDebuff[];
  currentHp: number;
  currentMp: number;
}

export interface ISkill {
  id: string;
  name: string;
  description: string;
  classId: string;
  levelRequired: number;
  type: SkillType;
  targetType: SkillTargetType;
  element: ElementType;
  manaCost: number;
  cooldown: number;
  castTime: number;
  range: number;
  aoeRadius: number;
  damageMultiplier: number;
  healingMultiplier: number;
  buffDuration: number;
  buffValue: number;
  effects: ISkillEffect[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISkillEffect {
  type: SkillEffectType;
  value: number;
  duration: number;
  chance: number;
  target: 'self' | 'enemy' | 'ally';
}

export interface IBuff {
  id: string;
  name: string;
  description: string;
  type: BuffType;
  value: number;
  duration: number;
  remainingTime: number;
  stackCount: number;
  sourceId: string;
  sourceName: string;
  icon: string;
}

export interface IDebuff {
  id: string;
  name: string;
  description: string;
  type: DebuffType;
  value: number;
  duration: number;
  remainingTime: number;
  stackCount: number;
  sourceId: string;
  sourceName: string;
  icon: string;
}

export interface IStack {
  id: string;
  itemId: string;
  quantity: number;
  slotIndex: number;
}

export interface IEquipment {
  id: string;
  characterId: string;
  weapon: IItem | null;
  helmet: IItem | null;
  chestplate: IItem | null;
  leggings: IItem | null;
  boots: IItem | null;
  gloves: IItem | null;
  ring1: IItem | null;
  ring2: IItem | null;
  amulet: IItem | null;
  belt: IItem | null;
  cape: IItem | null;
  artifact: IItem | null;
}

export interface IItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: RarityType;
  level: number;
  tier: number;
  stats: IItemStats;
  requirements: IItemRequirements;
  sellPrice: number;
  buyPrice: number;
  isTradable: boolean;
  isSoulbound: boolean;
  maxStack: number;
  durability: number;
  maxDurability: number;
  element: ElementType;
  setBonusId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IItemStats {
  hp?: number;
  mp?: number;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  vitality?: number;
  wisdom?: number;
  agility?: number;
  attackPower?: number;
  magicPower?: number;
  defense?: number;
  magicDefense?: number;
  critRate?: number;
  critDamage?: number;
  dodge?: number;
  block?: number;
  penetration?: number;
  haste?: number;
  healing?: number;
  resistance?: Record<string, number>;
}

export interface IItemRequirements {
  level?: number;
  classId?: string;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
}

export interface IClass {
  id: string;
  name: string;
  description: string;
  lore: string;
  role: ClassRole;
  primaryStat: string;
  hpMultiplier: number;
  mpMultiplier: number;
  baseStats: Partial<IItemStats>;
  statGrowth: Partial<IItemStats>;
  skills: ISkill[];
  rank: number;
  rankName: string;
  requirements: IClassRequirements | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassRequirements {
  level: number;
  previousClassId?: string;
  questId?: string;
  stats?: Partial<IItemStats>;
}

export interface IQuest {
  id: string;
  title: string;
  description: string;
  lore: string;
  type: QuestType;
  level: number;
  requiredLevel: number;
  objectives: IQuestObjective[];
  rewards: IQuestReward;
  prerequisites: string[];
  npcId: string;
  mapId: string;
  isRepeatable: boolean;
  isDaily: boolean;
  cooldownHours: number;
  timeLimitMinutes: number;
  failureConditions: IQuestFailureCondition[];
  dialogueStart: string[];
  dialogueProgress: string[];
  dialogueComplete: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestObjective {
  type: QuestObjectiveType;
  targetId: string;
  targetName: string;
  quantity: number;
  progress: number;
  description: string;
  locationX?: number;
  locationY?: number;
  radius?: number;
}

export interface IQuestReward {
  experience: number;
  gold: number;
  items: Array<{ itemId: string; quantity: number }>;
  reputation: Record<string, number>;
  classUnlock?: string;
  skillUnlock?: string;
}

export interface IQuestFailureCondition {
  type: 'death' | 'timeout' | 'leave_area' | 'item_lost';
  value: string | number;
}

export interface IGuild {
  id: string;
  name: string;
  tag: string;
  description: string;
  leaderId: string;
  level: number;
  experience: number;
  members: IGuildMember[];
  rank: number;
  bank: IGuildBank;
  hallLevel: number;
  hallMapId: string;
  created: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuildMember {
  characterId: string;
  characterName: string;
  rank: GuildRank;
  joinedAt: Date;
  contribution: number;
  lastOnline: Date;
}

export interface IGuildBank {
  gold: number;
  items: Array<{ itemId: string; quantity: number }>;
  logs: Array<{ action: string; characterId: string; timestamp: Date }>;
}

export interface IMap {
  id: string;
  name: string;
  description: string;
  lore: string;
  width: number;
  height: number;
  type: MapType;
  dangerLevel: number;
  requiredLevel: number;
  recommendedLevel: number;
  isInstance: boolean;
  maxPlayers: number;
  bosses: INPC[];
  monsters: INPC[];
  npcs: INPC[];
  connections: IMapConnection[];
  resources: IMapResource[];
  spawnPoints: ISpawnPoint[];
  music: string;
  ambient: string;
  weather: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMapConnection {
  mapId: string;
  targetMapId: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  requiredLevel: number;
  requiredQuestId: string | null;
  direction: string;
}

export interface IMapResource {
  id: string;
  name: string;
  type: ResourceType;
  x: number;
  y: number;
  respawnTime: number;
  requiredLevel: number;
  requiredSkill: string;
  rewards: Array<{ itemId: string; quantity: number; chance: number }>;
}

export interface ISpawnPoint {
  id: string;
  npcId: string;
  x: number;
  y: number;
  radius: number;
  respawnTime: number;
  maxCount: number;
  currentCount: number;
}

export interface INPC {
  id: string;
  name: string;
  title: string;
  description: string;
  type: NPCType;
  level: number;
  maxHp: number;
  maxMp: number;
  stats: Partial<IItemStats>;
  faction: string;
  aggression: AggressionType;
  respawnTime: number;
  experienceReward: number;
  goldDrop: [number, number];
  lootTable: ILootEntry[];
  dialogue: string[];
  shop: string[];
  quests: string[];
  behavior: NPCBehavior;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILootEntry {
  itemId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
  isGuaranteed: boolean;
}

export interface INPCBehavior {
  movement: 'stationary' | 'patrol' | 'random';
  patrolPath: Array<{ x: number; y: number; waitTime: number }>;
  abilities: string[];
  attackPattern: string[];
  enrageAtHp: number;
  enrageAbility: string;
  spawnEffects: string[];
  deathEffects: string[];
}

export type SkillType = 'ACTIVE' | 'PASSIVE' | 'ULTIMATE' | 'AUTO_ATTACK';
export type SkillTargetType = 'SELF' | 'SINGLE_ENEMY' | 'ALL_ENEMIES' | 'SINGLE_ALLY' | 'ALL_ALLIES' | 'AREA';
export type SkillEffectType = 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'DOT' | 'HOT' | 'STUN' | 'SILENCE' | 'ROOT' | 'FEAR' | 'TAUNT' | 'DISPEL' | 'SHIELD' | 'TELEPORT' | 'REVIVE';
export type ElementType = 'NORMAL' | 'FIRE' | 'WATER' | 'EARTH' | 'WIND' | 'LIGHT' | 'DARK' | 'ARCANE';
export type BuffType = 'ATTACK_UP' | 'DEFENSE_UP' | 'SPEED_UP' | 'CRIT_UP' | 'REGEN' | 'SHIELD' | 'EMPOWER' | 'HASTE';
export type DebuffType = 'ATTACK_DOWN' | 'DEFENSE_DOWN' | 'SPEED_DOWN' | 'POISON' | 'BLEED' | 'BURN' | 'FREEZE' | 'STUN' | 'SILENCE' | 'BLIND' | 'WEAKEN' | 'CURSE';
export type ItemType = 'WEAPON' | 'HELMET' | 'CHESTPLATE' | 'LEGGINGS' | 'BOOTS' | 'GLOVES' | 'RING' | 'AMULET' | 'BELT' | 'CAPE' | 'ARTIFACT' | 'CONSUMABLE' | 'MATERIAL' | 'QUEST' | 'KEY' | 'TOKEN';
export type RarityType = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
export type ClassRole = 'TANK' | 'DAMAGE' | 'HEALER' | 'SUPPORT' | 'BALANCED';
export type QuestType = 'MAIN' | 'SIDE' | 'DAILY' | 'CLASS' | 'EVENT' | 'GUILD' | 'EPIC';
export type QuestObjectiveType = 'KILL' | 'GATHER' | 'TALK' | 'ESCORT' | 'DELIVER' | 'EXPLORE' | 'USE' | 'CRAFT' | 'REACH' | 'SURVIVE';
export type GuildRank = 'LEADER' | 'OFFICER' | 'VETERAN' | 'MEMBER' | 'RECRUIT';
export type MapType = 'OVERWORLD' | 'DUNGEON' | 'RAID' | 'TOWN' | 'DUNGEON_ENTRANCE' | 'ARENA' | 'BOSS_ARENA';
export type NPCType = 'MONSTER' | 'BOSS' | 'MERCHANT' | 'QUEST_GIVER' | 'TRAINER' | 'BLACKSMITH' | 'ENCHANTER' | 'GUIDE';
export type AggressionType = 'PASSIVE' | 'AGGRESSIVE' | 'NEUTRAL' | 'FRIENDLY' | 'GUARD';
export type ResourceType = 'MINING' | 'HERBALISM' | 'LOGGING' | 'FISHING' | 'HUNTING';
