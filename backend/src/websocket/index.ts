import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config';
import { logger } from '../shared/logger';
import { setupChatGateway } from '../modules/chat/chat.gateway';
import { jwt } from 'jsonwebtoken';

let io: SocketIOServer;

export function initializeWebSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    maxHttpBufferSize: 1e6,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`WebSocket error on ${socket.id}:`, error);
    });
  });

  setupChatGateway(io);

  logger.info('WebSocket server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export async function broadcastToAll(event: string, data: unknown): Promise<void> {
  if (io) {
    io.emit(event, data);
  }
}

export async function broadcastToChannel(channel: string, event: string, data: unknown): Promise<void> {
  if (io) {
    io.to(channel).emit(event, data);
  }
}

export async function sendToUser(userId: string, event: string, data: unknown): Promise<void> {
  if (io) {
    const sockets = await io.fetchSockets();
    for (const socket of sockets) {
      const user = (socket as any).user;
      if (user && user.id === userId) {
        socket.emit(event, data);
      }
    }
  }
}
