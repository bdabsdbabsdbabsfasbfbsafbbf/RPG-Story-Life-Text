import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Character } from '../../characters/domain/character.entity';

@Entity('stacks')
export class StackEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  sourceSkillId: string;

  @ManyToOne(() => Character, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: Character;

  @Column()
  ownerId: string;

  @Column({ nullable: true })
  targetId: string;

  @Column({ default: 0 })
  currentStacks: number;

  @Column({ default: 10 })
  maxStacks: number;

  @Column('simple-json', { nullable: true })
  effects: {
    perStack: Record<string, number>;
    onMaxStacks?: string;
    onConsume?: string;
  };

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  isGlobal: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
