import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../core/database";
import { config } from "../../core/config";
import { authenticate, requireRole, AuthPayload } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";
import { DEFAULT_GAME_LIMITS, invalidateGameLimits } from "../../core/gameLimits";

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

  // Game economy limits (level, gold, diamonds, XP curve)
  app.get("/api/admin/settings/limits", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const row = await prisma.systemConfig.findUnique({ where: { key: "limits" } });
      res.json({ ...DEFAULT_GAME_LIMITS, ...(row?.value as object | undefined) });
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/admin/settings/limits", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { maxLevel, maxGold, maxDiamonds, xpPerLevel } = req.body;
      const value = {
        maxLevel:
          typeof maxLevel === "number" && maxLevel > 0 ? Math.floor(maxLevel) : DEFAULT_GAME_LIMITS.maxLevel,
        maxGold:
          typeof maxGold === "number" && maxGold >= 0 ? Math.floor(maxGold) : DEFAULT_GAME_LIMITS.maxGold,
        maxDiamonds:
          typeof maxDiamonds === "number" && maxDiamonds >= 0 ? Math.floor(maxDiamonds) : DEFAULT_GAME_LIMITS.maxDiamonds,
        xpPerLevel:
          typeof xpPerLevel === "number" && xpPerLevel > 0 ? Math.floor(xpPerLevel) : DEFAULT_GAME_LIMITS.xpPerLevel,
      };
      await prisma.systemConfig.upsert({
        where: { key: "limits" },
        update: { value },
        create: { key: "limits", value },
      });
      invalidateGameLimits();
      res.json(value);
    } catch (err) {
      next(err);
    }
  });

  // Stats
  app.get("/api/admin/stats", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [totalUsers, totalCharacters, totalGuilds, totalClasses, totalItems, totalMonsters, totalMaps, totalQuests, totalSkills, totalEffects, totalStatModels, totalRaces, totalTraits, activePlayers] = await Promise.all([
        prisma.user.count(),
        prisma.character.count(),
        prisma.guild.count(),
        prisma.gameClass.count(),
        prisma.item.count(),
        prisma.monster.count(),
        prisma.map.count(),
        prisma.quest.count(),
        prisma.skill.count(),
        prisma.effect.count(),
        prisma.statModel.count(),
        prisma.race.count(),
        prisma.trait.count(),
        prisma.user.count({ where: { isOnline: true } }),
      ]);
      res.json({ totalUsers, totalCharacters, totalGuilds, totalClasses, totalItems, totalMonsters, totalMaps, totalQuests, totalSkills, totalEffects, totalStatModels, totalRaces, totalTraits, activePlayers });
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
      const { displayName, email, role, level, experience, gold, diamonds, isBanned, isOnline } = req.body;
      const data: Record<string, any> = {};
      if (typeof displayName === "string") data.displayName = displayName.slice(0, 50);
      if (typeof email === "string" || email === null) data.email = email;
      if (typeof role === "string" && ["player", "admin", "owner"].includes(role)) data.role = role;
      if (typeof level === "number" && level >= 1) data.level = Math.floor(level);
      if (typeof experience === "number" && experience >= 0) data.experience = BigInt(Math.floor(experience));
      if (typeof gold === "number" && gold >= 0) data.gold = BigInt(Math.floor(gold));
      if (typeof diamonds === "number" && diamonds >= 0) data.diamonds = Math.floor(diamonds);
      if (typeof isBanned === "boolean") data.isBanned = isBanned;
      if (typeof isOnline === "boolean") data.isOnline = isOnline;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data,
        select: { id: true, username: true, displayName: true, role: true, level: true, gold: true, diamonds: true },
      });
      res.json(user);
    } catch (err) { next(err); }
  });

  // User detail: account + characters + inventory
  app.get("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: {
          characters: {
            include: {
              class: { select: { id: true, name: true, slug: true, role: true } },
              race: { select: { id: true, name: true } },
              trait: { select: { id: true, name: true } },
              classProgress: {
                include: { gameClass: { select: { id: true, name: true, slug: true } } },
                orderBy: { isActive: "desc" },
              },
            },
          },
          inventory: {
            include: { item: true },
            orderBy: { acquiredAt: "desc" },
          },
        },
      });
      if (!user) throw new AppError(404, "User not found");
      res.json(user);
    } catch (err) { next(err); }
  });

  // Delete user (children cascade)
  app.delete("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ message: "User deleted" });
    } catch (err) { next(err); }
  });

  // Edit a user's character: level, xp, class, name
  app.put("/api/admin/users/:userId/characters/:charId", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, level, experience, classId } = req.body;
      const character = await prisma.character.findFirst({
        where: { id: req.params.charId, userId: req.params.userId },
      });
      if (!character) throw new AppError(404, "Character not found");

      const data: Record<string, any> = {};
      if (typeof name === "string" && name.trim()) data.name = name.trim().slice(0, 50);
      if (typeof level === "number" && level >= 1) data.level = Math.floor(level);
      if (typeof experience === "number" && experience >= 0) data.experience = BigInt(Math.floor(experience));
      if (typeof classId === "string") {
        const gameClass = await prisma.gameClass.findFirst({ where: { id: classId, isActive: true } });
        if (!gameClass) throw new AppError(404, "Class not found");
        data.classId = gameClass.id;
      }

      await prisma.$transaction(async (tx) => {
        if (data.classId && data.classId !== character.classId) {
          await tx.characterClass.upsert({
            where: { characterId_classId: { characterId: character.id, classId: data.classId } },
            update: { isActive: true },
            create: { characterId: character.id, classId: data.classId, isActive: true },
          });
          await tx.characterClass.updateMany({
            where: { characterId: character.id, classId: { not: data.classId } },
            data: { isActive: false },
          });
        }
        await tx.character.update({ where: { id: character.id }, data });
      });

      res.json({ message: "Character updated" });
    } catch (err) { next(err); }
  });

  // Set all of a character's classes to max rank
  app.post("/api/admin/users/:userId/characters/:charId/rank-max", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const character = await prisma.character.findFirst({
        where: { id: req.params.charId, userId: req.params.userId },
      });
      if (!character) throw new AppError(404, "Character not found");

      const maxRank = 10;
      await prisma.characterClass.updateMany({
        where: { characterId: character.id },
        data: { rank: maxRank },
      });
      res.json({ message: `All classes set to rank ${maxRank}` });
    } catch (err) { next(err); }
  });

  // User inventory
  app.get("/api/admin/users/:id/inventory", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inventory = await prisma.inventory.findMany({
        where: { userId: req.params.id },
        include: { item: true },
        orderBy: { acquiredAt: "desc" },
      });
      res.json(inventory);
    } catch (err) { next(err); }
  });

  app.post("/api/admin/users/:id/inventory", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId, itemName, quantity } = req.body;
      const qty = Math.max(1, Math.floor(Number(quantity) || 1));
      let item = null;
      if (itemId) item = await prisma.item.findUnique({ where: { id: itemId } });
      else if (itemName) item = await prisma.item.findFirst({ where: { name: itemName, isActive: true } });
      if (!item) throw new AppError(404, "Item not found");

      const existing = await prisma.inventory.findFirst({
        where: { userId: req.params.id, itemId: item.id, slotIndex: null },
      });
      let entry;
      if (existing) {
        entry = await prisma.inventory.update({
          where: { id: existing.id },
          data: { quantity: { increment: qty } },
        });
      } else {
        entry = await prisma.inventory.create({
          data: { userId: req.params.id, itemId: item.id, quantity: qty },
        });
      }
      res.status(201).json(entry);
    } catch (err) { next(err); }
  });

  app.delete("/api/admin/users/:id/inventory/:invId", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.inventory.delete({
        where: { id: req.params.invId },
      });
      res.json({ message: "Inventory entry deleted" });
    } catch (err) { next(err); }
  });

  // Redeem codes CRUD
  app.get("/api/admin/codes", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await prisma.redeemCode.findMany({
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { redemptions: true } } },
        })
      );
    } catch (err) { next(err); }
  });

  app.post("/api/admin/codes", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, description, gold, diamonds, experience, items, maxUses, expiresAt, isActive } = req.body;
      if (!code || typeof code !== "string" || !code.trim()) throw new AppError(400, "Code required");
      const data: Record<string, any> = {
        code: code.trim().toUpperCase(),
        description: typeof description === "string" ? description : null,
        gold: BigInt(Math.max(0, Math.floor(Number(gold) || 0))),
        diamonds: Math.max(0, Math.floor(Number(diamonds) || 0)),
        experience: BigInt(Math.max(0, Math.floor(Number(experience) || 0))),
        maxUses: Math.max(1, Math.floor(Number(maxUses) || 1000)),
      };
      if (Array.isArray(items)) data.items = items;
      if (expiresAt) data.expiresAt = new Date(expiresAt);
      if (typeof isActive === "boolean") data.isActive = isActive;
      res.status(201).json(await prisma.redeemCode.create({ data: data as any }));
    } catch (err) { next(err); }
  });

  app.put("/api/admin/codes/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, description, gold, diamonds, experience, items, maxUses, expiresAt, isActive } = req.body;
      const data: Record<string, any> = {};
      if (typeof code === "string" && code.trim()) data.code = code.trim().toUpperCase();
      if (typeof description === "string" || description === null) data.description = description;
      if (typeof gold === "number" && gold >= 0) data.gold = BigInt(Math.floor(gold));
      if (typeof diamonds === "number" && diamonds >= 0) data.diamonds = Math.floor(diamonds);
      if (typeof experience === "number" && experience >= 0) data.experience = BigInt(Math.floor(experience));
      if (Array.isArray(items)) data.items = items;
      if (typeof maxUses === "number" && maxUses >= 1) data.maxUses = Math.floor(maxUses);
      if (expiresAt) data.expiresAt = new Date(expiresAt);
      if (typeof isActive === "boolean") data.isActive = isActive;
      res.json(await prisma.redeemCode.update({ where: { id: req.params.id }, data }));
    } catch (err) { next(err); }
  });

  app.delete("/api/admin/codes/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.redeemCode.delete({ where: { id: req.params.id } });
      res.json({ message: "Deleted" });
    } catch (err) { next(err); }
  });

  // Json-native fields per model (Prisma Json type): accept objects directly
  const JSON_FIELDS: Record<string, string[]> = {
    race: ["traits"],
    trait: ["modifiers"],
    code: ["items"],
    class: ["resource"],
    skill: ["scaling", "actions", "conditions", "onConditionMet", "events"],
    passive: ["statModifiers", "skillModifiers", "effectModifiers", "conditions", "events"],
    effect: ["stackLoss", "tickDamage", "tickHealing", "statModifiers", "onMaxStacks", "onExpire", "onTick"],
    statmodel: ["base", "perLevel", "scaling"],
  };

  // Relações opcionais: string vazia/null vira null (evita FK error)
  const NULLABLE_RELATIONS: Record<string, string[]> = {
    class: ["statModelId"],
  };

  function normalizeBody(model: string, body: any): any {
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const jsonFields = new Set(JSON_FIELDS[model] || []);
    const nullableIds = new Set(NULLABLE_RELATIONS[model] || []);
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(body)) {
      if (nullableIds.has(k) && (v === "" || v === null || v === undefined)) {
        out[k] = null;
      } else if (jsonFields.has(k)) {
        if (typeof v === "string") {
          try { out[k] = JSON.parse(v); } catch { out[k] = v; }
        } else {
          out[k] = v;
        }
      } else if (v !== null && (typeof v === "object" || Array.isArray(v))) {
        out[k] = JSON.stringify(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  async function saveGameClass(id: string | null, body: any) {
    const data = normalizeBody("class", body);
    try {
      return id
        ? await prisma.gameClass.update({ where: { id }, data })
        : await prisma.gameClass.create({ data });
    } catch (err: any) {
      if (err?.code === "P2003") {
        throw new AppError(400, "Stat Model inválido — escolha um Stat Model existente no campo da classe");
      }
      throw err;
    }
  }

  // Classes CRUD
  app.get("/api/admin/classes", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.gameClass.findMany({ include: { statModel: true }, orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/classes", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await saveGameClass(null, req.body)); } catch (err) { next(err); }
  });

  app.put("/api/admin/classes/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await saveGameClass(req.params.id, req.body)); } catch (err) { next(err); }
  });

  app.delete("/api/admin/classes/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.gameClass.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Stat models CRUD
  app.get("/api/admin/statmodels", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.statModel.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/statmodels", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.statModel.create({ data: normalizeBody("statmodel", req.body) })); } catch (err) { next(err); }
  });

  app.put("/api/admin/statmodels/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.statModel.update({ where: { id: req.params.id }, data: normalizeBody("statmodel", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/statmodels/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.statModel.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Items CRUD
  app.get("/api/admin/items", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.item.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/items", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.item.create({ data: normalizeBody("item", req.body) })); } catch (err) { next(err); }
  });

  app.put("/api/admin/items/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.item.update({ where: { id: req.params.id }, data: normalizeBody("item", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/items/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.item.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Monsters CRUD
  app.get("/api/admin/monsters", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.monster.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/monsters", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.monster.create({ data: normalizeBody("monster", req.body) })); } catch (err) { next(err); }
  });

  app.put("/api/admin/monsters/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.monster.update({ where: { id: req.params.id }, data: normalizeBody("monster", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/monsters/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.monster.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Maps CRUD
  app.get("/api/admin/maps", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.map.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/maps", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.map.create({ data: normalizeBody("map", req.body) })); } catch (err) { next(err); }
  });

  app.put("/api/admin/maps/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.map.update({ where: { id: req.params.id }, data: normalizeBody("map", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/maps/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.map.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Quests CRUD
  app.get("/api/admin/quests", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.quest.findMany({ orderBy: { title: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/quests", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.quest.create({ data: normalizeBody("quest", req.body) })); } catch (err) { next(err); }
  });

  app.put("/api/admin/quests/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.quest.update({ where: { id: req.params.id }, data: normalizeBody("quest", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/quests/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.quest.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Skills CRUD
  app.get("/api/admin/classes/:classId/skills", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.skill.findMany({ where: { classId: req.params.classId }, orderBy: { sortOrder: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/classes/:classId/skills", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.skill.create({ data: { ...normalizeBody("skill", req.body), classId: req.params.classId } })); } catch (err) { next(err); }
  });

  app.put("/api/admin/skills/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.skill.update({ where: { id: req.params.id }, data: normalizeBody("skill", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/skills/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.skill.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Class passives CRUD
  app.get("/api/admin/classes/:classId/passives", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.passive.findMany({ where: { classId: req.params.classId }, orderBy: { rankRequired: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/classes/:classId/passives", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.passive.create({ data: { ...normalizeBody("passive", req.body), classId: req.params.classId } })); } catch (err) { next(err); }
  });

  app.put("/api/admin/passives/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.passive.update({ where: { id: req.params.id }, data: normalizeBody("passive", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/passives/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.passive.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Effects CRUD (buffs/debuffs/hots/dots independentes)
  app.get("/api/admin/effects", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.effect.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/effects", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.effect.create({ data: normalizeBody("effect", req.body) })); } catch (err) { next(err); }
  });

  app.put("/api/admin/effects/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.effect.update({ where: { id: req.params.id }, data: normalizeBody("effect", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/effects/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.effect.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Races CRUD
  app.get("/api/admin/races", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.race.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/races", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.race.create({ data: normalizeBody("race", req.body) })); } catch (err) { next(err); }
  });

  app.put("/api/admin/races/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.race.update({ where: { id: req.params.id }, data: normalizeBody("race", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/races/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.race.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });

  // Traits CRUD
  app.get("/api/admin/traits", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.trait.findMany({ orderBy: { name: "asc" } })); } catch (err) { next(err); }
  });

  app.post("/api/admin/traits", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await prisma.trait.create({ data: normalizeBody("trait", req.body) })); } catch (err) { next(err); }
  });

  app.put("/api/admin/traits/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await prisma.trait.update({ where: { id: req.params.id }, data: normalizeBody("trait", req.body) })); } catch (err) { next(err); }
  });

  app.delete("/api/admin/traits/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try { await prisma.trait.delete({ where: { id: req.params.id } }); res.json({ message: "Deleted" }); } catch (err) { next(err); }
  });
}
