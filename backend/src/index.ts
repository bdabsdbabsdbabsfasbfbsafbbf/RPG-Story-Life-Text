import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config } from './config';
import { connectDatabase } from './shared/infrastructure/database/PrismaClient';
import { RedisClient } from './shared/infrastructure/cache/RedisClient';
import { SocketServer } from './shared/infrastructure/websocket/SocketServer';
import { errorHandler } from './api/middleware/ErrorHandler';
import routes from './api/routes';
import { logger } from './shared/infrastructure/logger/Logger';

async function bootstrap(): Promise<void> {
  const app = express();
  const httpServer = createServer(app);

  // Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
  });
  app.use('/api', limiter);

  // API routes
  app.use('/api', routes);

  // Error handler
  app.use(errorHandler);

  // Connect to services
  await connectDatabase();
  await RedisClient.connect();

  // Initialize WebSocket
  SocketServer.initialize(httpServer);

  // Start server
  httpServer.listen(config.port, config.host, () => {
    logger.info(`Server running on http://${config.host}:${config.port}`);
    logger.info(`Environment: ${config.env}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    httpServer.close();
    await RedisClient.disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    httpServer.close();
    await RedisClient.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap application:', error);
  process.exit(1);
});
