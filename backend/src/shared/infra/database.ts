import { DataSource } from 'typeorm';
import { config } from '../../config';
import { User } from '../../modules/auth/domain/user.entity';
import { Character } from '../../modules/characters/domain/character.entity';
import { ClassEntity } from '../../modules/classes/domain/class.entity';
import { SkillEntity } from '../../modules/skills/domain/skill.entity';
import { InventoryItem } from '../../modules/inventory/domain/inventory-item.entity';
import { EquipmentEntity } from '../../modules/equipment/domain/equipment.entity';
import { GuildEntity } from '../../modules/guild/domain/guild.entity';
import { GuildMember } from '../../modules/guild/domain/guild-member.entity';
import { MarketListing } from '../../modules/market/domain/market-listing.entity';
import { QuestEntity } from '../../modules/quest/domain/quest.entity';
import { QuestProgress } from '../../modules/quest/domain/quest-progress.entity';
import { MapEntity } from '../../modules/maps/domain/map.entity';
import { NPCEntity } from '../../modules/npc/domain/npc.entity';
import { BuffEntity } from '../../modules/buffs/domain/buff.entity';
import { StackEntity } from '../../modules/stacks/domain/stack.entity';
import { CombatLog } from '../../modules/combat/domain/combat-log.entity';
import { ChatMessage } from '../../modules/chat/domain/chat-message.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: config.isDev,
  logging: config.isDev,
  entities: [
    User,
    Character,
    ClassEntity,
    SkillEntity,
    InventoryItem,
    EquipmentEntity,
    GuildEntity,
    GuildMember,
    MarketListing,
    QuestEntity,
    QuestProgress,
    MapEntity,
    NPCEntity,
    BuffEntity,
    StackEntity,
    CombatLog,
    ChatMessage,
  ],
  migrations: ['src/shared/infra/migrations/*.ts'],
  subscribers: [],
});
