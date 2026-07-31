import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../core/BaseController';
import { authService } from './auth.service';
import { registerSchema, loginSchema, discordAuthSchema, updateProfileSchema } from './auth.dto';
import { ValidationError } from '../../shared/errors';

export class AuthController extends BaseController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }
      const result = await authService.register(parsed.data);
      this.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }
      const result = await authService.login(parsed.data);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async discordCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = discordAuthSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }
      const result = await authService.authenticateWithDiscord(parsed.data.code);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.body.token || req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        throw new ValidationError('Token is required');
      }
      const result = await authService.refreshToken(token);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (userId) {
        await authService.logout(userId);
      }
      this.success(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const profile = await authService.getProfile(userId);
      this.success(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }
      const profile = await authService.updateProfile(userId, parsed.data as any);
      this.success(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async discordRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorizeUrl = new URL('https://discord.com/api/oauth2/authorize');
      authorizeUrl.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID || '');
      authorizeUrl.searchParams.set('redirect_uri', process.env.DISCORD_CALLBACK_URL || '');
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('scope', 'identify email guilds');
      res.redirect(authorizeUrl.toString());
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
