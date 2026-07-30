import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export enum BuffType {
  ATTACK_UP = 'attack_up',
  DEFENSE_UP = 'defense_up',
  MAGIC_UP = 'magic_up',
  SPEED_UP = 'speed_up',
  CRIT_UP = 'crit_up',
  HEAL_OVER_TIME = 'heal_over_time',
  MANA_REGEN = 'mana_regen',
  STAMINA_REGEN = 'stamina_regen',
  DAMAGE_REDUCTION = 'damage_reduction',
  ATTACK_SPEED_UP = 'attack_speed_up',
  COOLDOWN_REDUCTION = 'cooldown_reduction',
  DODGE_UP = 'dodge_up',
  LUCK_UP = 'luck_up',
  CUSTOM = 'custom',
}

export enum DebuffType {
  ATTACK_DOWN = 'attack_down',
  DEFENSE_DOWN = 'defense_down',
  MAGIC_DOWN = 'magic_down',
  SPEED_DOWN = 'speed_down',
  BLEEDING = 'bleeding',
  POISON = 'poison',
  BURN = 'burn',
  STUN = 'stun',
  SILENCE = 'silence',
  SLOW = 'slow',
  FEAR = 'fear',
  BLIND = 'blind',
  CURSED = 'cursed',
  CUSTOM = 'custom',
}

@Entity('buffs')
export class BuffEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column()
  isDebuff: boolean;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: string;

  @Column({ default: 0 })
  value: number;

  @Column({ default: 0 })
  duration: number;

  @Column({ default: 1 })
  maxStacks: number;

  @Column({ default: false })
  isStackable: boolean;

  @Column('simple-json', { nullable: true })
  stackEffects: {
    perStackValue?: number;
    onMaxStacks?: string;
    consumeOnUse?: boolean;
  };

  @Column('simple-json', { nullable: true })
  conditions: Array<{
    type: string;
    value: string | number;
  }>;

  @Column({ default: 0 })
  tickInterval: number;

  @Column({ default: 0 })
  tickDamage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
