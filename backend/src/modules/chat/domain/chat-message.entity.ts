import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../../auth/domain/user.entity';

export enum ChatChannel {
  GLOBAL = 'global',
  LOCAL = 'local',
  GUILD = 'guild',
  PARTY = 'party',
  TRADE = 'trade',
  WHISPER = 'whisper',
  SYSTEM = 'system',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @Column()
  senderName: string;

  @Column({
    type: 'enum',
    enum: ChatChannel,
    default: ChatChannel.GLOBAL,
  })
  channel: ChatChannel;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  recipientId: string;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ nullable: true })
  guildId: string;

  @Column({ nullable: true })
  partyId: string;

  @Column({ nullable: true })
  mapId: string;

  @CreateDateColumn()
  createdAt: Date;
}
