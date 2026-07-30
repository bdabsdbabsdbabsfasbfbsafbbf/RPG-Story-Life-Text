import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export enum EquipmentSlot {
  HELMET = 'helmet',
  CHESTPLATE = 'chestplate',
  LEGS = 'legs',
  BOOTS = 'boots',
  GLOVES = 'gloves',
  WEAPON = 'weapon',
  SHIELD = 'shield',
  AMULET = 'amulet',
  RING_1 = 'ring_1',
  RING_2 = 'ring_2',
  CAPE = 'cape',
  RELIC = 'relic',
  PET = 'pet',
}

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
  DIVINE = 'divine',
}

@Entity('equipment')
export class EquipmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: EquipmentSlot,
  })
  slot: EquipmentSlot;

  @Column({
    type: 'enum',
    enum: Rarity,
    default: Rarity.COMMON,
  })
  rarity: Rarity;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  requiredLevel: number;

  @Column('simple-json', { default: {} })
  stats: Record<string, number>;

  @Column('simple-json', { nullable: true })
  enchantments: Array<{
    type: string;
    value: number;
    name?: string;
  }>;

  @Column('simple-json', { nullable: true })
  gems: string[];

  @Column('simple-json', { nullable: true })
  runes: string[];

  @Column('simple-json', { nullable: true })
  buffs: Array<{
    id: string;
    duration: number;
    value: number;
  }>;

  @Column('simple-json', { nullable: true })
  passives: string[];

  @Column('simple-json', { nullable: true })
  specialEffects: Array<{
    trigger: string;
    effect: string;
    chance: number;
    value?: number;
  }>;

  @Column({ default: true })
  tradeable: boolean;

  @Column({ default: 0 })
  sellPrice: number;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
