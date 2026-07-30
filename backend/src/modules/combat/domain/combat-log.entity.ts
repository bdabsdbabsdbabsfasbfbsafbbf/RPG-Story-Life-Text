import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Character } from '../../characters/domain/character.entity';

@Entity('combat_logs')
export class CombatLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Character, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attackerId' })
  attacker: Character;

  @Column()
  attackerId: string;

  @Column({ nullable: true })
  targetId: string;

  @Column({ nullable: true })
  targetName: string;

  @Column()
  action: string;

  @Column({ default: 0 })
  damage: number;

  @Column({ default: 0 })
  healing: number;

  @Column({ default: false })
  isCritical: boolean;

  @Column({ default: false })
  isDodged: boolean;

  @Column({ default: false })
  isBlocked: boolean;

  @Column('simple-json', { nullable: true })
  effects: Array<{
    type: string;
    name: string;
    duration?: number;
    stacks?: number;
  }>;

  @Column({ default: false })
  isPvp: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
