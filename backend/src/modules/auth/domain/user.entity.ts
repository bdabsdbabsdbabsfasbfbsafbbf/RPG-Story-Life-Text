import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn
} from 'typeorm';
import { Character } from '../../characters/domain/character.entity';

export enum UserRole {
  PLAYER = 'player',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  discordId: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PLAYER,
  })
  role: UserRole;

  @Column({ default: 0 })
  gold: number;

  @Column({ default: 0 })
  diamonds: number;

  @Column({ default: 0 })
  totalPlayTime: number;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @OneToOne(() => Character, (character) => character.user, { cascade: true })
  @JoinColumn()
  character: Character;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
