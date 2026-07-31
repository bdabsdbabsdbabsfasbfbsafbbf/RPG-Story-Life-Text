import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IBaseRepository<T> {
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  findById(id: string, relations?: string[]): Promise<T | null>;
  findOne(where: FindOptionsWhere<T>, relations?: string[]): Promise<T | null>;
  create(data: DeepPartial<T>): Promise<T>;
  update(id: string, data: QueryDeepPartialEntity<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  count(where?: FindOptionsWhere<T>): Promise<number>;
  exists(where: FindOptionsWhere<T>): Promise<boolean>;
  paginate(page: number, limit: number, options?: Omit<FindManyOptions<T>, 'skip' | 'take'>): Promise<{
    items: T[];
    total: number;
    page: number;
    limit: number;
  }>;
}

export interface IAuthService {
  register(data: { username: string; email: string; password: string }): Promise<{ user: any; token: string }>;
  login(data: { email: string; password: string }): Promise<{ user: any; token: string }>;
  authenticateWithDiscord(code: string): Promise<{ user: any; token: string }>;
  refreshToken(token: string): Promise<{ token: string }>;
  logout(userId: string): Promise<void>;
  validateToken(token: string): Promise<any>;
  getProfile(userId: string): Promise<any>;
}

export interface IChatService {
  sendMessage(senderId: string, channel: string, content: string): Promise<any>;
  getMessages(channel: string, page: number, limit: number): Promise<any>;
  deleteMessage(messageId: string, userId: string): Promise<boolean>;
  createChannel(name: string, type: string, createdBy: string): Promise<any>;
  joinChannel(channelId: string, userId: string): Promise<void>;
  leaveChannel(channelId: string, userId: string): Promise<void>;
  getOnlineUsers(channelId: string): Promise<string[]>;
}

export interface ICombatService {
  startCombat(characterId: string, targetId: string): Promise<any>;
  processTurn(characterId: string, skillId: string): Promise<any>;
  useItem(characterId: string, itemId: string): Promise<any>;
  flee(characterId: string): Promise<boolean>;
  getCombatState(characterId: string): Promise<any>;
  endCombat(characterId: string): Promise<void>;
}

export interface IPlayerService {
  getCharacter(characterId: string): Promise<any>;
  getInventory(characterId: string): Promise<any>;
  equipItem(characterId: string, itemId: string, slot: string): Promise<any>;
  unequipItem(characterId: string, slot: string): Promise<any>;
  useItem(characterId: string, itemId: string, quantity: number): Promise<any>;
  dropItem(characterId: string, itemId: string, quantity: number): Promise<any>;
  moveCharacter(characterId: string, x: number, y: number): Promise<any>;
  getCharacterStats(characterId: string): Promise<any>;
  levelUp(characterId: string): Promise<any>;
  assignStatPoints(characterId: string, stats: Record<string, number>): Promise<any>;
}

export interface IGuildService {
  createGuild(leaderId: string, name: string, tag: string): Promise<any>;
  disbandGuild(guildId: string, userId: string): Promise<void>;
  inviteMember(guildId: string, inviterId: string, targetId: string): Promise<void>;
  kickMember(guildId: string, kickerId: string, targetId: string): Promise<void>;
  promoteMember(guildId: string, promoterId: string, targetId: string, newRank: string): Promise<void>;
  getGuild(guildId: string): Promise<any>;
  getGuildMembers(guildId: string): Promise<any[]>;
  depositGold(guildId: string, characterId: string, amount: number): Promise<void>;
  withdrawGold(guildId: string, characterId: string, amount: number): Promise<void>;
  updateGuildDescription(guildId: string, userId: string, description: string): Promise<void>;
}

export interface IMarketService {
  createListing(sellerId: string, itemId: string, quantity: number, price: number): Promise<any>;
  cancelListing(listingId: string, userId: string): Promise<void>;
  buyItem(listingId: string, buyerId: string, quantity: number): Promise<any>;
  getListings(page: number, limit: number, filters?: any): Promise<any>;
  getMyListings(userId: string): Promise<any[]>;
  getMarketHistory(itemId: string): Promise<any[]>;
}

export interface IQuestService {
  acceptQuest(characterId: string, questId: string): Promise<any>;
  completeQuest(characterId: string, questId: string): Promise<any>;
  abandonQuest(characterId: string, questId: string): Promise<void>;
  getActiveQuests(characterId: string): Promise<any[]>;
  getCompletedQuests(characterId: string): Promise<any[]>;
  updateQuestProgress(characterId: string, questId: string, objectiveIndex: number, progress: number): Promise<any>;
  getAvailableQuests(characterId: string, npcId?: string): Promise<any[]>;
}

export interface IItemService {
  getItem(itemId: string): Promise<any>;
  createItem(data: any): Promise<any>;
  updateItem(itemId: string, data: any): Promise<any>;
  deleteItem(itemId: string): Promise<boolean>;
  getAllItems(page: number, limit: number, filters?: any): Promise<any>;
  getItemsByType(type: string): Promise<any[]>;
  getItemsByLevelRange(minLevel: number, maxLevel: number): Promise<any[]>;
}

export interface INPCService {
  getNPC(npcId: string): Promise<any>;
  getNPCsByMap(mapId: string): Promise<any[]>;
  getNPCsByType(type: string): Promise<any[]>;
  spawnNPC(npcId: string, mapId: string, x: number, y: number): Promise<any>;
  despawnNPC(npcInstanceId: string): Promise<void>;
  getDialogue(npcId: string, dialogueId: string): Promise<string>;
  interact(npcId: string, characterId: string, action: string): Promise<any>;
}
