import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { ClassEntity } from '../../classes/domain/class.entity';

export enum SkillType {
  ACTIVE = 'active',
  PASSIVE = 'passive',
  ULTIMATE = 'ultimate',
  BASIC = 'basic',
}

export enum SkillTarget {
  SELF = 'self',
  ENEMY = 'enemy',
  ALLY = 'ally',
  ALL_ENEMIES = 'all_enemies',
  ALL_ALLIES = 'all_allies',
  AREA = 'area',
}

@Entity('skills')
export class SkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  icon: string;

  @Column({
    type: 'enum',
    enum: SkillType,
    default: SkillType.ACTIVE,
  })
  type: SkillType;

  @Column({
    type: 'enum',
    enum: SkillTarget,
    default: SkillTarget.ENEMY,
  })
  target: SkillTarget;

  @ManyToOne(() => ClassEntity, (cls) => cls.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: ClassEntity;

  @Column()
  classId: string;

  @Column({ default: 0 })
  rankRequired: number;

  @Column({ default: 0 })
  manaCost: number;

  @Column({ default: 0 })
  staminaCost: number;

  @Column({ default: 0 })
  cooldown: number;

  @Column({ default: 0 })
  castTime: number;

  @Column({ default: 0 })
  duration: number;

  @Column({ default: 0 })
  range: number;

  @Column('simple-json', { nullable: true })
  damage: {
    base: number;
    scaling?: Record<string, number>;
    type?: string;
  };

  @Column('simple-json', { nullable: true })
  healing: {
    base: number;
    scaling?: Record<string, number>;
  };

  @Column('simple-json', { nullable: true })
  buffs: Array<{
    type: string;
    value: number;
    duration: number;
    maxStacks?: number;
    target?: string;
  }>;

  @Column('simple-json', { nullable: true })
  debuffs: Array<{
    type: string;
    value: number;
    duration: number;
    maxStacks?: number;
    target?: string;
  }>;

  @Column('simple-json', { nullable: true })
  stackEffects: {
    generateStack?: string;
    consumeStack?: string;
    effectOnMax?: string;
    maxStacks?: number;
  };

  @Column('simple-json', { nullable: true })
  conditions: Array<{
    type: string;
    value: string | number;
    target?: string;
  }>;

  @Column({ default: false })
  isPassive: boolean;

  @Column('simple-json', { nullable: true })
  comboLinks: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
