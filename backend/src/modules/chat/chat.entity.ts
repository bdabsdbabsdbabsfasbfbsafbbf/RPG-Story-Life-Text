import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../core/BaseEntity';

@Entity('messages')
export class Message extends BaseEntity {
  @Column({ name: 'sender_id' })
  @Index()
  senderId: string;

  @Column({ name: 'sender_name', length: 32 })
  senderName: string;

  @Column({ length: 32 })
  @Index()
  channel: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', default: [] })
  mentions: string[];

  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  editedAt: Date | null;
}
