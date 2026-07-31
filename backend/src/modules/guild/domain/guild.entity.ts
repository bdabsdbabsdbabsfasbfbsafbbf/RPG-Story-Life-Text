import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { GuildMember } from './guild-member.entity';

@Entity('guilds')
export class GuildEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  tag: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ default: 0 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 0 })
  gold: number;

  @Column({ default: 0 })
  memberCount: number;

  @Column({ default: 10 })
  maxMembers: number;

  @Column('simple-json', { default: {} })
  perks: Record<string, number>;

  @Column('simple-json', { nullable: true })
  bank: Record<string, number>;

  @Column({ default: 0 })
  rank: number;

  @Column({ default: 0 })
  totalContribution: number;

  @Column({ nullable: true })
  ownerId: string;

  @OneToMany(() => GuildMember, (member) => member.guild)
  members: GuildMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
