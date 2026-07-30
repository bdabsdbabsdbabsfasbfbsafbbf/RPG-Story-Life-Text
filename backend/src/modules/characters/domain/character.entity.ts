import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';
import { ClassEntity } from '../../classes/domain/class.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.character)
  @JoinColumn()
  user: User;

  @Column()
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 100 })
  experienceToNext: number;

  @Column({ default: 100 })
  maxHp: number;

  @Column({ default: 100 })
  currentHp: number;

  @Column({ default: 50 })
  maxMana: number;

  @Column({ default: 50 })
  currentMana: number;

  @Column({ default: 100 })
  maxStamina: number;

  @Column({ default: 100 })
  currentStamina: number;

  @Column({ default: 0 })
  rank: number;

  @Column({ default: 0 })
  title: string;

  @Column({ default: 1 })
  mapId: number;

  @Column({ default: 'Spawn' })
  location: string;

  @Column({ nullable: true })
  guildId: string;

  @Column({ default: 0 })
  kills: number;

  @Column({ default: 0 })
  deaths: number;

  @Column({ default: 0 })
  pvpWins: number;

  @Column({ default: 0 })
  pvpLosses: number;

  @ManyToOne(() => ClassEntity)
  @JoinColumn({ name: 'activeClassId' })
  activeClass: ClassEntity;

  @Column({ nullable: true })
  activeClassId: string;

  @Column('simple-json', { default: '[]' })
  unlockedClasses: string[];

  @Column({ default: false })
  inCombat: boolean;

  @Column({ nullable: true })
  combatTargetId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
