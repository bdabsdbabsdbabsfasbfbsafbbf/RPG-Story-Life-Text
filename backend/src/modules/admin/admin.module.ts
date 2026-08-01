import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../core/database";
import { config } from "../../core/config";
import { authenticate, requireRole, AuthPayload } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  authenticate(req, res, () => {
    requireRole("admin", "owner")(req, res, next);
  });
}

const DEFAULT_GUILD_SETTINGS = {
  requiredLevel: 2,
  requiredGold: 200,
  requiredDiamonds: 0,
};

export function createAdminModule(app: Express): void {
  // Admin auth
  app.post("/api/admin/auth/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) throw new AppError(400, "Username and password required");

      const user = await prisma.user.findUnique({ where: { username } });
      if (!user || !user.passwordHash) throw new AppError(401, "Invalid credentials");
      if (user.role !== "admin" && user.role !== "owner") {
        throw new AppError(403, "Account does not have admin access");
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new AppError(401, "Invalid credentials");

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role } as AuthPayload,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      );

      res.json({
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/auth/me", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, username: true, displayName: true, role: true },
      });
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  });

  // Guild creation requirements (adjustable in the admin panel)
  app.get("/api/admin/settings/guild", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await prisma.systemConfig.findUnique({ where: { key: "guild" } });
      res.json({ ...DEFAULT_GUILD_SETTINGS, ...(config?.value as object | undefined) });
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/admin/settings/guild", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requiredLevel, requiredGold, requiredDiamonds } = req.body;
      const value = {
        requiredLevel:
          typeof requiredLevel === "number" && requiredLevel >= 0 ? Math.floor(requiredLevel) : DEFAULT_GUILD_SETTINGS.requiredLevel,
        requiredGold:
          typeof requiredGold === "number" && requiredGold >= 0 ? Math.floor(requiredGold) : DEFAULT_GUILD_SETTINGS.requiredGold,
        requiredDiamonds:
          typeof requiredDiamonds === "number" && requiredDiamonds >= 0 ? Math.floor(requiredDiamonds) : DEFAULT_GUILD_SETTINGS.requiredDiamonds,
      };
      const config = await prisma.systemConfig.upsert({
        where: { key: "guild" },
        update: { value },
        create: { key: "guild", value },
      });
      res.json(config.value);
    } catch (err) {
      next(err);
    }
  });

  // Stats
  app.get("/api/admin/stats", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [totalUsers, totalCharacters, totalGuilds, totalClasses, totalItems, totalMonsters, totalMaps, totalQuests, totalSkills, totalBuffs, totalRaces, totalTraits, activePlayers] = await Promise.all([
        prisma.user.count(),
        prisma.character.count(),
        prisma.guild.count(),
        prisma.gameClass.count(),
        prisma.item.count(),
        prisma.monster.count(),
        prisma.map.count(),
        prisma.quest.count(),
        prisma.skill.count(),
        prisma.buff.count(),
        prisma.race.count(),
        prisma.trait.count(),
        prisma.user.count({ where: { isOnline: true } }),
      ]);
      res.json({ totalUsers, totalCharacters, totalGuilds, totalClasses, totalItems, totalMonsters, totalMaps, totalQuests, totalSkills, totalBuffs, totalRaces, totalTraits, activePlayers });
    } catch (err) { next(err); }
  });

  // Users
  app.get("/api/admin/users", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true, username: true, displayName: true, email: true, role: true,
          level: true, gold: true, diamonds: true, isOnline: true, isBanned: true,
          createdAt: true, _count: { select: { characters: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(users);
    } catch (err) { next(err); }
  });

  app.put("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
      res.json(user);
    } catch (err) { next(err); }
  });

  // Classes CRUD
  app.get("/api/admin/classes", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.gameClass.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/classes", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.gameClass.create({ data: req.body })); } catch (err) { next(err); }
  });

  app.put("/api/admin/classes/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.gameClass.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/classes/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.gameClass.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Items CRUD
  app.get("/api/admin/items", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.item.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/items", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.item.create({ data: req.body })); } catch (err) { next(err); }
  });

  app.put("/api/admin/items/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.item.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/items/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.item.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Monsters CRUD
  app.get("/api/admin/monsters", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.monster.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/monsters", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.monster.create({ data: req.body })); } catch (err) { next(err); }
  });

  app.put("/api/admin/monsters/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.monster.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/monsters/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.monster.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Maps CRUD
  app.get("/api/admin/maps", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.map.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/maps", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.map.create({ data: req.body })); } catch (err) { next(err); }
  });

  app.put("/api/admin/maps/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.map.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/maps/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.map.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Quests CRUD
  app.get("/api/admin/quests", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.quest.findMany({ orderBy: { title: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/quests", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.quest.create({ data: req.body })); } catch (err) { next(err); }
  });

  app.put("/api/admin/quests/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.quest.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/quests/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.quest.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Skills CRUD
  app.get("/api/admin/classes/:classId/skills", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.skill.findMany({ where: { classId: req.params.classId }, orderBy: { sortOrder: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/classes/:classId/skills", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.skill.create({ data: { ...req.body, classId: req.params.classId } })); } catch (err) { next(err); }
  });

  app.put("/api/admin/skills/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.skill.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/skills/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.skill.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Buffs CRUD
  app.get("/api/admin/buffs", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.buff.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/buffs", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.buff.create({ data: req.body })); } catch (err) { next(err); }
  });

  app.put("/api/admin/buffs/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.buff.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/buffs/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.buff.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Races CRUD
  app.get("/api/admin/races", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.race.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/races", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.race.create({ data: req.body })); } catch (err) { next(err); }
  });

  app.put("/api/admin/races/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.race.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/races/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.race.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Traits CRUD
  app.get("/api/admin/traits", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.trait.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/traits", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.trait.create({ data: req.body })); } catch (err) { next(err); }
  });

  app.put("/api/admin/traits/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.trait.update({ where: { id: req.params.id }, data: req.body })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/traits/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.trait.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });
}
