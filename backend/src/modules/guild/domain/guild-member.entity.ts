import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { GuildEntity } from './guild.entity';
import { User } from '../../auth/domain/user.entity';

export enum GuildRole {
  MEMBER = 'member',
  OFFICER = 'officer',
  LEADER = 'leader',
  OWNER = 'owner',
}

@Entity('guild_members')
export class GuildMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GuildEntity, (guild) => guild.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guildId' })
  guild: GuildEntity;

  @Column()
  guildId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: GuildRole,
    default: GuildRole.MEMBER,
  })
  role: GuildRole;

  @Column({ default: 0 })
  contribution: number;

  @Column({ default: 0 })
  donatedGold: number;

  @Column({ default: 0 })
  questsCompleted: number;

  @CreateDateColumn()
  joinedAt: Date;
}
