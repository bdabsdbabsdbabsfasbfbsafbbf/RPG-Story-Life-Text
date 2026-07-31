import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../modules/auth/infrastructure/JwtService';

export interface AuthRequest extends Request {
  playerId?: string;
  username?: string;
  isAdmin?: boolean;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    
    req.playerId = decoded.playerId;
    req.username = decoded.username;
    req.isAdmin = decoded.isAdmin || false;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.isAdmin) {
    res.status(403).json({ error: 'Acesso restrito a administradores' });
    return;
  }
  next();
}
