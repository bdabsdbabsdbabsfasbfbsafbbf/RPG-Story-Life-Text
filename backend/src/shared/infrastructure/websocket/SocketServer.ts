import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../../../modules/auth/infrastructure/JwtService';
import { RedisClient } from '../cache/RedisClient';

interface AuthenticatedSocket extends Socket {
  playerId?: string;
  username?: string;
}

export class SocketServer {
  private static io: Server;

  static initialize(httpServer: HTTPServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }
        const decoded = await verifyToken(token as string);
        socket.playerId = decoded.playerId;
        socket.username = decoded.username;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`Player connected: ${socket.username} (${socket.id})`);

      socket.join(`player:${socket.playerId}`);

      socket.on('join-map', (mapId: string) => {
        socket.join(`map:${mapId}`);
        socket.to(`map:${mapId}`).emit('player-joined', {
          id: socket.playerId,
          name: socket.username,
        });
      });

      socket.on('leave-map', (mapId: string) => {
        socket.leave(`map:${mapId}`);
        socket.to(`map:${mapId}`).emit('player-left', {
          id: socket.playerId,
          name: socket.username,
        });
      });

      socket.on('chat-message', async (data: { channel: string; content: string }) => {
        const message = {
          playerId: socket.playerId,
          username: socket.username,
          content: data.content,
          channel: data.channel,
          timestamp: new Date(),
        };

        if (data.channel === 'global') {
          this.io.emit('chat-message', message);
        } else if (data.channel === 'map') {
          // sent to map room
        }
      });

      socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.username} (${socket.id})`);
      });
    });

    return this.io;
  }

  static getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO not initialized');
    }
    return this.io;
  }

  static emitToPlayer(playerId: string, event: string, data: unknown): void {
    this.io.to(`player:${playerId}`).emit(event, data);
  }

  static emitToMap(mapId: string, event: string, data: unknown): void {
    this.io.to(`map:${mapId}`).emit(event, data);
  }

  static emitGlobal(event: string, data: unknown): void {
    this.io.emit(event, data);
  }
}
