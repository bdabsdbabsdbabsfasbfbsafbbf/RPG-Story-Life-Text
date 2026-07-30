import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/connection';
import { config } from '../../config';
import { User } from './auth.entity';
import { BaseService } from '../../core/BaseService';
import { UnauthorizedError, ConflictError, ValidationError } from '../../shared/errors';
import { logger } from '../../shared/logger';

export class AuthService extends BaseService<User> {
  private discordTokenUrl = 'https://discord.com/api/oauth2/token';
  private discordUserUrl = 'https://discord.com/api/users/@me';

  constructor() {
    super(AppDataSource.getRepository(User));
  }

  async register(data: { username: string; email: string; password: string }): Promise<{ user: Partial<User>; token: string }> {
    const existingUser = await this.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const existingUsername = await this.findOne({ username: data.username });
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      discriminator: Math.floor(1000 + Math.random() * 9000).toString(),
    });

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(data: { email: string; password: string }): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.findOne({ email: data.email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.isBanned) {
      throw new UnauthorizedError('Account is banned');
    }

    if (!user.password) {
      throw new UnauthorizedError('This account uses Discord login. Please login with Discord.');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user);
    user.lastLogin = new Date();
    await this.repository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async authenticateWithDiscord(code: string): Promise<{ user: Partial<User>; token: string }> {
    try {
      const tokenResponse = await fetch(this.discordTokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.discord.clientId,
          client_secret: config.discord.clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.discord.callbackUrl,
          scope: config.discord.scope.join(' '),
        }),
      });

      if (!tokenResponse.ok) {
        throw new UnauthorizedError('Failed to authenticate with Discord');
      }

      const tokenData = await tokenResponse.json();

      const userResponse = await fetch(this.discordUserUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userResponse.ok) {
        throw new UnauthorizedError('Failed to fetch Discord user');
      }

      const discordUser = await userResponse.json();

      let user = await this.findOne({ discordId: discordUser.id });

      if (user) {
        user.accessToken = tokenData.access_token;
        user.refreshToken = tokenData.refresh_token;
        user.lastLogin = new Date();
        user.username = discordUser.username;
        user.discriminator = discordUser.discriminator;
        user.avatar = discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null;
        user.email = discordUser.email || user.email;
        await this.repository.save(user);
      } else {
        const existingEmail = await this.findOne({ email: discordUser.email });
        if (existingEmail) {
          existingEmail.discordId = discordUser.id;
          existingEmail.accessToken = tokenData.access_token;
          existingEmail.refreshToken = tokenData.refresh_token;
          existingEmail.lastLogin = new Date();
          existingEmail.isVerified = true;
          await this.repository.save(existingEmail);
          user = existingEmail;
        } else {
          user = await this.create({
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            email: discordUser.email || `${discordUser.id}@discord.local`,
            avatar: discordUser.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : null,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            isVerified: true,
            lastLogin: new Date(),
          });
        }
      }

      const token = this.generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      logger.error('Discord authentication error:', error);
      throw error instanceof UnauthorizedError ? error : new UnauthorizedError('Discord authentication failed');
    }
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      const user = await this.findById(decoded.userId);

      if (!user || user.isBanned) {
        throw new UnauthorizedError('Invalid token');
      }

      return { token: this.generateToken(user) };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async logout(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.lastLogin = new Date();
      await this.repository.save(user);
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      const user = await this.findById(decoded.userId);

      if (!user || user.isBanned) {
        throw new UnauthorizedError('Invalid token');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    const { password, accessToken, refreshToken, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, data: Record<string, unknown>): Promise<Partial<User>> {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (data.username && data.username !== user.username) {
      const existing = await this.findOne({ username: data.username as string });
      if (existing) {
        throw new ConflictError('Username already taken');
      }
    }

    Object.assign(user, data);
    await this.repository.save(user);

    const { password, accessToken, refreshToken, ...profile } = user;
    return profile;
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        discordId: user.discordId,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

export const authService = new AuthService();
