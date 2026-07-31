import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate, requireRole } from "../../core/middleware/auth";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  authenticate(req, res, () => {
    requireRole("admin", "owner")(req, res, next);
  });
}

export function createAdminModule(app: Express): void {
  // Stats
  app.get("/api/admin/stats", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [totalUsers, totalClasses, totalItems, totalMonsters, totalMaps, totalQuests, totalSkills, activePlayers] = await Promise.all([
        prisma.user.count(),
        prisma.gameClass.count(),
        prisma.item.count(),
        prisma.monster.count(),
        prisma.map.count(),
        prisma.quest.count(),
        prisma.skill.count(),
        prisma.user.count({ where: { isOnline: true } }),
      ]);
      res.json({ totalUsers, totalClasses, totalItems, totalMonsters, totalMaps, totalQuests, totalSkills, activePlayers });
    } catch (err) { next(err); }
  });

  // Users
  app.get("/api/admin/users", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({ select: { id: true, username: true, displayName: true, role: true, level: true, isOnline: true, isBanned: true } });
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
}
