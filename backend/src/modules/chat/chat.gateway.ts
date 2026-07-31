import { Request, Response, NextFunction } from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { BaseController } from '../../core/BaseController';
import { chatService } from './chat.service';
import { UnauthorizedError, ValidationError } from '../../shared/errors';
import { CHAT_CONSTANTS } from '../../shared/constants';
import { logger } from '../../shared/logger';
import { authService } from '../auth/auth.service';

export class ChatController extends BaseController {
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channel } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await chatService.getMessages(channel, page, limit);
      result.items = result.items.reverse();
      this.paginated(res, result.items, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      await chatService.deleteMessage(req.params.id, userId);
      this.success(res, { message: 'Message deleted' });
    } catch (error) {
      next(error);
    }
  }

  async getOnlineUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = chatService.getOnlineCount();
      this.success(res, { onlineCount: count });
    } catch (error) {
      next(error);
    }
  }
}

export function setupChatGateway(io: SocketIOServer): void {
  const onlineUsers = new Map<string, { socketId: string; username: string; channel: string }>();

  const authMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const user = await authService.validateToken(token as string);
      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  };

  io.use(authMiddleware);

  io.on('connection', async (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`Chat user connected: ${user.username}`);

    socket.on('chat:join', async (channel: string) => {
      try {
        if (!channel || typeof channel !== 'string') {
          socket.emit('error', { message: 'Invalid channel' });
          return;
        }

        await chatService.joinChannel(channel, user.id);
        socket.join(channel);
        onlineUsers.set(user.id, { socketId: socket.id, username: user.username, channel });

        io.to(channel).emit('chat:user_joined', {
          userId: user.id,
          username: user.username,
          channel,
          onlineCount: chatService.getOnlineUsers(channel).length,
        });

        logger.debug(`${user.username} joined channel: ${channel}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join channel' });
      }
    });

    socket.on('chat:leave', async (channel: string) => {
      try {
        await chatService.leaveChannel(channel, user.id);
        socket.leave(channel);
        onlineUsers.delete(user.id);

        io.to(channel).emit('chat:user_left', {
          userId: user.id,
          username: user.username,
          channel,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to leave channel' });
      }
    });

    socket.on('chat:message', async (data: { channel: string; content: string }) => {
      try {
        if (!data.channel || !data.content) {
          socket.emit('error', { message: 'Channel and content are required' });
          return;
        }

        const message = await chatService.sendMessage(
          user.id,
          user.username,
          data.channel,
          data.content
        );

        io.to(data.channel).emit('chat:message', {
          id: message.id,
          senderId: message.senderId,
          senderName: message.senderName,
          channel: message.channel,
          content: message.content,
          mentions: message.mentions,
          createdAt: message.createdAt,
        });
      } catch (error) {
        if (error instanceof ValidationError) {
          socket.emit('error', { message: error.message });
        } else {
          logger.error('Chat message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    });

    socket.on('chat:typing', (data: { channel: string; isTyping: boolean }) => {
      socket.to(data.channel).emit('chat:typing', {
        userId: user.id,
        username: user.username,
        channel: data.channel,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(user.id);
      logger.info(`Chat user disconnected: ${user.username}`);
    });
  });
}
