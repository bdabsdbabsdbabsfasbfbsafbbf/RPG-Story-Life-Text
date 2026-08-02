import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { prisma } from "../../core/database";
import { config } from "../../core/config";
import { authenticate, AuthPayload } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(30),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export function createAuthModule(app: Express): void {
  app.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);

      const existing = await prisma.user.findFirst({
        where: { OR: [{ username: data.username }, { email: data.email }] },
      });
      if (existing) {
        throw new AppError(409, "Username or email already taken");
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      const user = await prisma.user.create({
        data: {
          username: data.username,
          displayName: data.displayName,
          email: data.email,
          passwordHash,
        },
      });

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          characters: [],
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { username: data.username } });
      if (!user || !user.passwordHash) {
        throw new AppError(401, "Invalid credentials");
      }

      const valid = await bcrypt.compare(data.password, user.passwordHash);
      if (!valid) {
        throw new AppError(401, "Invalid credentials");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), isOnline: true },
      });

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const characters = await prisma.character.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, level: true, classId: true },
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          characters,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true, username: true, displayName: true, email: true, avatar: true,
          experience: true, level: true, gold: true, diamonds: true,
          role: true, createdAt: true, isOnline: true,
          characters: {
            select: {
              id: true, name: true, level: true, classId: true,
              experience: true, currentHp: true, currentMana: true,
              class: { select: { name: true, slug: true, baseHp: true, baseMana: true } },
              race: { select: { name: true } },
              trait: { select: { name: true } },
            },
          },
        },
      });
      if (!user) throw new AppError(404, "User not found");
      res.json({
        ...user,
        characters: user.characters.map((c: any) => ({
          ...c,
          experience: Number(c.experience),
          experienceToNext: c.level * 150,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/auth/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { displayName, avatar } = req.body;
      const data: { displayName?: string; avatar?: string } = {};
      if (typeof displayName === "string" && displayName.trim()) {
        if (displayName.trim().length > 30) throw new AppError(400, "Display name too long");
        data.displayName = displayName.trim();
      }
      if (typeof avatar === "string" && avatar.length > 0) data.avatar = avatar;

      const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data,
        select: {
          id: true, username: true, displayName: true, email: true, avatar: true,
          experience: true, level: true, gold: true, diamonds: true,
          role: true, createdAt: true, isOnline: true,
          characters: {
            select: {
              id: true, name: true, level: true, classId: true,
              experience: true, currentHp: true, currentMana: true,
              class: { select: { name: true, slug: true, baseHp: true, baseMana: true } },
              race: { select: { name: true } },
              trait: { select: { name: true } },
            },
          },
        },
      });
      res.json({
        ...user,
        characters: user.characters.map((c: any) => ({
          ...c,
          experience: Number(c.experience),
          experienceToNext: c.level * 150,
        })),
      });
    } catch (err) {
      next(err);
    }
  });
}
