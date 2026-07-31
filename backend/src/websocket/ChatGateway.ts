import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../shared/logger';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  channel: string;
  content: string;
  mentions: string[];
  isSystem: boolean;
  createdAt: Date;
}

export class ChatWebSocketGateway {
  private userChannels: Map<string, Set<string>> = new Map();

  initialize(io: SocketIOServer): void {
    const chatNamespace = io.of('/chat');

    chatNamespace.on('connection', (socket: Socket) => {
      logger.info(`Chat WebSocket connected: ${socket.id}`);

      socket.on('chat:join', (channel: string) => {
        this.handleJoinChannel(socket, channel);
      });

      socket.on('chat:leave', (channel: string) => {
        this.handleLeaveChannel(socket, channel);
      });

      socket.on('chat:message', (data: { channel: string; content: string; senderId: string; senderName: string }) => {
        this.handleMessage(chatNamespace, socket, data);
      });

      socket.on('chat:whisper', (data: { targetId: string; content: string; senderId: string; senderName: string }) => {
        this.handleWhisper(chatNamespace, socket, data);
      });

      socket.on('chat:typing', (data: { channel: string; isTyping: boolean }) => {
        this.handleTyping(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleJoinChannel(socket: Socket, channel: string): void {
    socket.join(channel);
    if (!this.userChannels.has(socket.id)) {
      this.userChannels.set(socket.id, new Set());
    }
    this.userChannels.get(socket.id)!.add(channel);
    
    socket.to(channel).emit('chat:user_joined', {
      userId: socket.id,
      channel,
      timestamp: new Date(),
    });
  }

  private handleLeaveChannel(socket: Socket, channel: string): void {
    socket.leave(channel);
    this.userChannels.get(socket.id)?.delete(channel);
    
    socket.to(channel).emit('chat:user_left', {
      userId: socket.id,
      channel,
      timestamp: new Date(),
    });
  }

  private handleMessage(namespace: any, socket: Socket, data: { channel: string; content: string; senderId: string; senderName: string }): void {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: data.senderId,
      senderName: data.senderName,
      channel: data.channel,
      content: data.content,
      mentions: this.extractMentions(data.content),
      isSystem: false,
      createdAt: new Date(),
    };

    namespace.to(data.channel).emit('chat:message', message);
  }

  private handleWhisper(namespace: any, socket: Socket, data: { targetId: string; content: string; senderId: string; senderName: string }): void {
    const whisperMessage: ChatMessage = {
      id: `whisper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: data.senderId,
      senderName: data.senderName,
      channel: `whisper:${data.senderId}:${data.targetId}`,
      content: `[Whisper] ${data.senderName}: ${data.content}`,
      mentions: [data.targetId],
      isSystem: false,
      createdAt: new Date(),
    };

    namespace.to(`player:${data.targetId}`).emit('chat:whisper', whisperMessage);
    socket.emit('chat:whisper_sent', whisperMessage);
  }

  private handleTyping(socket: Socket, data: { channel: string; isTyping: boolean }): void {
    socket.to(data.channel).emit('chat:typing', {
      userId: socket.id,
      channel: data.channel,
      isTyping: data.isTyping,
    });
  }

  private handleDisconnect(socket: Socket): void {
    const channels = this.userChannels.get(socket.id);
    if (channels) {
      channels.forEach((channel) => {
        socket.to(channel).emit('chat:user_left', {
          userId: socket.id,
          channel,
          timestamp: new Date(),
        });
      });
      this.userChannels.delete(socket.id);
    }
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

export const chatWebSocketGateway = new ChatWebSocketGateway();
