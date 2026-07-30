import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../server";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

export function createGuildModule(app: Express): void {
  app.get("/api/guilds", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const guilds = await prisma.guild.findMany({
        orderBy: { level: "desc" },
        take: 50,
      });
      res.json(guilds);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/guilds/rankings", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rankings = await prisma.guildRanking.findMany({
        orderBy: { rank: "asc" },
        include: { guild: { select: { name: true, tag: true, level: true } } },
        take: 100,
      });
      res.json(rankings);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/guilds/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guild = await prisma.guild.findUnique({
        where: { id: req.params.id },
        include: {
          members: { include: { user: { select: { username: true, displayName: true, level: true } } } },
          perks: true,
          bank: true,
        },
      });
      if (!guild) {
        res.status(404).json({ error: "Guild not found" });
        return;
      }
      res.json(guild);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/guilds", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, tag, description } = req.body;
      if (!name || !tag) throw new AppError(400, "Name and tag required");

      const existing = await prisma.guild.findFirst({
        where: { OR: [{ name }, { tag }] },
      });
      if (existing) throw new AppError(409, "Guild name or tag already taken");

      const guild = await prisma.$transaction(async (tx) => {
        const g = await tx.guild.create({
          data: { name, tag, description, memberCount: 1 },
        });
        await tx.guildMember.create({
          data: { guildId: g.id, userId: req.user!.userId, role: "leader" },
        });
        await tx.guildBank.create({ data: { guildId: g.id } });
        await tx.guildRanking.create({ data: { guildId: g.id } });
        return g;
      });

      res.status(201).json(guild);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/guilds/:id/join", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guild = await prisma.guild.findUnique({ where: { id: req.params.id } });
      if (!guild) throw new AppError(404, "Guild not found");

      const membership = await prisma.guildMember.findUnique({
        where: { guildId_userId: { guildId: req.params.id, userId: req.user!.userId } },
      });
      if (membership) throw new AppError(400, "Already a member");

      if (guild.memberCount >= guild.maxMembers) {
        throw new AppError(400, "Guild is full");
      }

      await prisma.$transaction(async (tx) => {
        await tx.guildMember.create({
          data: { guildId: req.params.id, userId: req.user!.userId, role: "member" },
        });
        await tx.guild.update({
          where: { id: req.params.id },
          data: { memberCount: { increment: 1 } },
        });
      });

      res.json({ message: "Joined guild" });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/guilds/:id/leave", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const membership = await prisma.guildMember.findUnique({
        where: { guildId_userId: { guildId: req.params.id, userId: req.user!.userId } },
      });
      if (!membership) throw new AppError(404, "Not a member");

      await prisma.$transaction(async (tx) => {
        await tx.guildMember.delete({ where: { id: membership.id } });
        await tx.guild.update({
          where: { id: req.params.id },
          data: { memberCount: { decrement: 1 } },
        });
      });

      res.json({ message: "Left guild" });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/user/guild", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const membership = await prisma.guildMember.findFirst({
        where: { userId: req.user!.userId },
        include: { guild: true },
      });
      res.json(membership);
    } catch (err) {
      next(err);
    }
  });
}
