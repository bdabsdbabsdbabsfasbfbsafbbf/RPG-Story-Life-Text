import { DataSource } from 'typeorm';
import { config } from '../config';
import { User } from '../modules/auth/auth.entity';
import { Message } from '../modules/chat/chat.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.isDev,
  logging: config.isDev,
  entities: [User, Message],
  migrations: [],
  subscribers: [],
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  ssl: config.isProd ? { rejectUnauthorized: false } : false,
});

export async function initializeDatabase(): Promise<DataSource> {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
    return AppDataSource;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}
