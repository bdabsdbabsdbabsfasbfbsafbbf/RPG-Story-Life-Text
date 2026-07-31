import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../core/BaseEntity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'discord_id', unique: true, nullable: true })
  @Index()
  discordId: string;

  @Column({ unique: true, length: 32 })
  @Index()
  username: string;

  @Column({ length: 4, default: '0000' })
  discriminator: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'access_token', nullable: true })
  accessToken: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin: Date;

  @Column({ name: 'is_banned', default: false })
  isBanned: boolean;

  @Column({ name: 'is_premium', default: false })
  isPremium: boolean;

  @Column({ name: 'premium_until', type: 'timestamptz', nullable: true })
  premiumUntil: Date;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'player_name', length: 24, nullable: true })
  playerName: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  roles: string[];
}
