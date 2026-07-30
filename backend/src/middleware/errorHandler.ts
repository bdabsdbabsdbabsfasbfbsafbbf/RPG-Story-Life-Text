import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { logger } from '../shared/logger';
import { config } from '../config';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn(`${err.name}: ${err.message}`, {
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
      details: err.details,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'SyntaxError' && (err as any).status === 400) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid JSON in request body',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err.name === 'MulterError') {
    const multerError = err as any;
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'File size exceeds limit',
      LIMIT_FILE_COUNT: 'Too many files',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
    };
    res.status(400).json({
      success: false,
      error: {
        message: messages[multerError.code] || 'File upload error',
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: config.isDev ? err.message : 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
}
