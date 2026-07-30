import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export enum NPCType {
  MERCHANT = 'merchant',
  QUEST_GIVER = 'quest_giver',
  BLACKSMITH = 'blacksmith',
  ENCHANTER = 'enchanter',
  BANKER = 'banker',
  GUILD_MASTER = 'guild_master',
  TRAINER = 'trainer',
  STORY = 'story',
  EVENT = 'event',
}

@Entity('npcs')
export class NPCEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  dialogue: string;

  @Column({
    type: 'enum',
    enum: NPCType,
    default: NPCType.STORY,
  })
  npcType: NPCType;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column('simple-json', { nullable: true })
  options: Array<{
    label: string;
    action: string;
    value?: string;
    condition?: string;
  }>;

  @Column('simple-json', { nullable: true })
  shopItems: string[];

  @Column('simple-json', { nullable: true })
  quests: string[];

  @Column({ nullable: true })
  mapId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
