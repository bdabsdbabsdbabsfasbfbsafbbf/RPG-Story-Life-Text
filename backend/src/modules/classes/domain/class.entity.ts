import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { SkillEntity } from '../../skills/domain/skill.entity';

export enum ClassRole {
  TANK = 'tank',
  SUPPORT = 'support',
  MAGE = 'mage',
  DPS = 'dps',
  HYBRID = 'hybrid',
  ASSASSIN = 'assassin',
}

export enum ClassDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum ElementType {
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  WIND = 'wind',
  LIGHT = 'light',
  DARK = 'dark',
  NEUTRAL = 'neutral',
}

@Entity('classes')
export class ClassEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  lore: string;

  @Column({
    type: 'enum',
    enum: ClassRole,
    default: ClassRole.DPS,
  })
  role: ClassRole;

  @Column({
    type: 'enum',
    enum: ClassDifficulty,
    default: ClassDifficulty.MEDIUM,
  })
  difficulty: ClassDifficulty;

  @Column({
    type: 'enum',
    enum: ElementType,
    default: ElementType.NEUTRAL,
  })
  element: ElementType;

  @Column('simple-json', { nullable: true })
  requirements: {
    level?: number;
    questId?: string;
    itemId?: string;
    previousClassId?: string;
  };

  @Column({ default: false })
  isStarter: boolean;

  @Column({ default: 1 })
  maxRank: number;

  @Column('simple-json', { default: {} })
  coreStats: Record<string, number>;

  @Column('simple-json', { default: {} })
  modifierStats: Record<string, number>;

  @Column('simple-json', { default: {} })
  combatStats: Record<string, number>;

  @Column('simple-json', { default: {} })
  scaling: Record<string, number>;

  @OneToMany(() => SkillEntity, (skill) => skill.class)
  skills: SkillEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
