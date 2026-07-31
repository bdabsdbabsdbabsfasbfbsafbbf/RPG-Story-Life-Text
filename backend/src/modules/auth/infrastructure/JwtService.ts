import jwt from 'jsonwebtoken';
import { config } from '../../../config';

export interface TokenPayload {
  playerId: string;
  username: string;
  isAdmin?: boolean;
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    }, (err, token) => {
      if (err) reject(err);
      else resolve(token as string);
    });
  });
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as TokenPayload);
    });
  });
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}
