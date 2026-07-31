import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../shared/errors';
import { logger } from '../shared/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
    discordId?: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization format. Use: Bearer <token>');
    }

    const token = parts[1];

    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      username: string;
      email: string;
      discordId?: string;
    };

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      discordId: decoded.discordId,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token has expired'));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
      return;
    }
    next(new UnauthorizedError('Authentication failed'));
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        username: string;
        email: string;
      };
      req.user = decoded;
    }
  } catch {
    // Silent fail for optional auth
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    authenticate(req, res, (err) => {
      if (err) {
        next(err);
        return;
      }
      next();
    });
  };
}
