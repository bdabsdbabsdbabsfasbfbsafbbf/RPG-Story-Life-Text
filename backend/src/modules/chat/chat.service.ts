import { Repository, LessThan } from 'typeorm';
import { AppDataSource } from '../../database/connection';
import { Message } from './chat.entity';
import { BaseService } from '../../core/BaseService';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/errors';
import { CHAT_CONSTANTS } from '../../shared/constants';
import { logger } from '../../shared/logger';

export class ChatService extends BaseService<Message> {
  private activeUsers: Map<string, Set<string>> = new Map();

  constructor() {
    super(AppDataSource.getRepository(Message));
  }

  async sendMessage(senderId: string, senderName: string, channel: string, content: string, isSystem: boolean = false): Promise<Message> {
    if (!isSystem) {
      if (content.length > CHAT_CONSTANTS.MAX_MESSAGE_LENGTH) {
        throw new ValidationError(`Message exceeds max length of ${CHAT_CONSTANTS.MAX_MESSAGE_LENGTH} characters`);
      }

      const whisperMatch = content.match(/^\/w\s+(\w+)\s+(.+)/);
      if (whisperMatch) {
        return this.sendWhisper(senderId, senderName, whisperMatch[1], whisperMatch[2]);
      }
    }

    const mentions = this.extractMentions(content);

    const message = await this.create({
      senderId,
      senderName,
      channel,
      content,
      mentions,
      isSystem,
    });

    return message;
  }

  private async sendWhisper(senderId: string, senderName: string, targetName: string, content: string): Promise<Message> {
    if (content.length > CHAT_CONSTANTS.MAX_WHISPER_LENGTH) {
      throw new ValidationError(`Whisper exceeds max length of ${CHAT_CONSTANTS.MAX_WHISPER_LENGTH} characters`);
    }

    const whisperContent = `[Whisper] ${senderName} -> ${targetName}: ${content}`;
    const message = await this.create({
      senderId,
      senderName,
      channel: `whisper:${senderId}:${targetName}`,
      content: whisperContent,
      mentions: [targetName],
      isSystem: false,
    });

    return message;
  }

  async getMessages(channel: string, page: number = 1, limit: number = 50): Promise<{ items: Message[]; total: number; page: number; limit: number }> {
    return this.paginate(page, Math.min(limit, 100), {
      where: { channel, isDeleted: false } as any,
      order: { createdAt: 'DESC' as any },
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const message = await this.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }
    if (message.senderId !== userId) {
      throw new ForbiddenError('You can only delete your own messages');
    }
    return this.update(messageId, { isDeleted: true } as any) as unknown as Promise<boolean>;
  }

  async createChannel(name: string, type: string, createdBy: string): Promise<{ id: string; name: string; type: string }> {
    if (!CHAT_CONSTANTS.CHANNEL_TYPES.includes(type as any)) {
      throw new ValidationError(`Invalid channel type. Must be one of: ${CHAT_CONSTANTS.CHANNEL_TYPES.join(', ')}`);
    }
    return { id: `${type}:${name}`, name, type };
  }

  async joinChannel(channelId: string, userId: string): Promise<void> {
    if (!this.activeUsers.has(channelId)) {
      this.activeUsers.set(channelId, new Set());
    }
    this.activeUsers.get(channelId)!.add(userId);
  }

  async leaveChannel(channelId: string, userId: string): Promise<void> {
    this.activeUsers.get(channelId)?.delete(userId);
    if (this.activeUsers.get(channelId)?.size === 0) {
      this.activeUsers.delete(channelId);
    }
  }

  getOnlineUsers(channelId: string): string[] {
    return Array.from(this.activeUsers.get(channelId) || []);
  }

  getOnlineCount(): number {
    const users = new Set<string>();
    this.activeUsers.forEach((userSet) => {
      userSet.forEach((u) => users.add(u));
    });
    return users.size;
  }

  async cleanupOldMessages(daysOld: number = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await this.repository.delete({
      createdAt: LessThan(cutoff) as any,
    } as any);

    return result.affected || 0;
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }
}

export const chatService = new ChatService();
