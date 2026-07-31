import { Request, Response, NextFunction } from 'express';
import { logger } from '../../shared/infrastructure/logger/Logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  logger.error('Unexpected error:', { error: err.message, stack: err.stack });

  res.status(500).json({
    error: 'Erro interno do servidor',
  });
}
