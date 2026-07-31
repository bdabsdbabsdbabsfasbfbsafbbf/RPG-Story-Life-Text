import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export enum QuestType {
  STORY = 'story',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  GUILD = 'guild',
  EVENT = 'event',
  BOSS = 'boss',
  HUNT = 'hunt',
  EXPLORATION = 'exploration',
}

export enum QuestDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  LEGENDARY = 'legendary',
}

@Entity('quests')
export class QuestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: QuestType,
    default: QuestType.STORY,
  })
  questType: QuestType;

  @Column({
    type: 'enum',
    enum: QuestDifficulty,
    default: QuestDifficulty.EASY,
  })
  difficulty: QuestDifficulty;

  @Column({ default: 1 })
  requiredLevel: number;

  @Column('simple-json')
  objectives: Array<{
    type: string;
    target: string;
    quantity: number;
    current?: number;
    description: string;
  }>;

  @Column('simple-json')
  rewards: {
    gold?: number;
    experience?: number;
    diamonds?: number;
    items?: Array<{ id: string; quantity: number }>;
    classId?: string;
    title?: string;
  };

  @Column('simple-json', { nullable: true })
  requirements: {
    previousQuestId?: string;
    level?: number;
    classId?: string;
    minRank?: number;
  };

  @Column({ nullable: true })
  mapId: string;

  @Column({ nullable: true })
  npcId: string;

  @Column({ default: false })
  isRepeatable: boolean;

  @Column({ nullable: true })
  cooldownMinutes: number;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
