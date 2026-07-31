import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import http from 'http';
import { config } from './config';
import { initializeDatabase, closeDatabase } from './database/connection';
import { initializeWebSocket } from './websocket';
import { errorHandler } from './middleware/errorHandler';
import { logger, stream } from './shared/logger';
import authRoutes from './modules/auth/auth.routes';
import chatRoutes from './modules/chat/chat.routes';

export class App {
  public app: express.Application;
  public server: http.Server;
  private isShuttingDown: boolean = false;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(helmet({
      contentSecurityPolicy: config.isProd ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }));

    this.app.use(cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    }));

    this.app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
    }));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    if (config.isDev) {
      this.app.use(morgan('dev', { stream }));
    } else {
      this.app.use(morgan('combined', { stream }));
    }

    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      next();
    });
  }

  private setupRoutes(): void {
    const apiRouter = express.Router();

    apiRouter.use('/auth', authRoutes);
    apiRouter.use('/chat', chatRoutes);

    apiRouter.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: '1.0.0',
      });
    });

    this.app.use('/api', apiRouter);

    this.app.get('/', (req, res) => {
      res.json({
        name: 'RPG Story Life API',
        version: '1.0.0',
        description: 'Backend for the MMORPG text game',
        environment: config.nodeEnv,
        docs: '/api/docs',
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      this.gracefulShutdown(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received');
      this.gracefulShutdown(0);
    });
  }

  public async start(): Promise<void> {
    try {
      logger.info('========================================');
      logger.info('  RPG Story Life - Backend Server');
      logger.info('========================================');
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Port: ${config.port}`);

      await initializeDatabase();
      logger.info('Database connected successfully');

      initializeWebSocket(this.server);
      logger.info('WebSocket server initialized');

      return new Promise((resolve) => {
        this.server.listen(config.port, () => {
          logger.info(`Server running on http://localhost:${config.port}`);
          logger.info(`WebSocket ready on ws://localhost:${config.port}`);
          logger.info('========================================');
          resolve();
        });
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      throw error;
    }
  }

  public async gracefulShutdown(exitCode: number = 0): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    logger.info('Initiating graceful shutdown...');

    const shutdownTimeout = setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);

    try {
      await new Promise<void>((resolve) => {
        this.server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });

      await closeDatabase();
      logger.info('Database connection closed');

      clearTimeout(shutdownTimeout);
      logger.info('Graceful shutdown complete');
      process.exit(exitCode);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  }
}

const app = new App();

app.start().catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});

export default app;
