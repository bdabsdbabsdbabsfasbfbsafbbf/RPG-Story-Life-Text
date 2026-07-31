import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(24, 'Username must be at most 24 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(2)
    .max(24)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  playerName: z.string().min(2).max(24).optional(),
  avatar: z.string().url().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const discordAuthSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  redirectUri: z.string().url().optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type DiscordAuthDto = z.infer<typeof discordAuthSchema>;
