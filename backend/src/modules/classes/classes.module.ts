import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../server";
import { authenticate } from "../../core/middleware/auth";

export function createClassesModule(app: Express): void {
  app.get("/api/classes", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const classes = await prisma.gameClass.findMany({
        where: { isActive: true },
        include: {
          skills: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
          classPassives: { orderBy: { rankRequired: "asc" } },
          masteryBonuses: { orderBy: { rank: "asc" } },
        },
        orderBy: { name: "asc" },
      });
      res.json(classes);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/classes/:slug", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gameClass = await prisma.gameClass.findUnique({
        where: { slug: req.params.slug },
        include: {
          skills: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
          classPassives: { orderBy: { rankRequired: "asc" } },
          classUpgrades: { orderBy: { rankRequired: "asc" } },
          masteryBonuses: { orderBy: { rank: "asc" } },
        },
      });
      if (!gameClass) {
        res.status(404).json({ error: "Class not found" });
        return;
      }
      res.json(gameClass);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/classes/:slug/skills", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gameClass = await prisma.gameClass.findUnique({
        where: { slug: req.params.slug },
      });
      if (!gameClass) {
        res.status(404).json({ error: "Class not found" });
        return;
      }
      const skills = await prisma.skill.findMany({
        where: { classId: gameClass.id, isActive: true },
        orderBy: { sortOrder: "asc" },
      });
      res.json(skills);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/classes/:slug/passives", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gameClass = await prisma.gameClass.findUnique({
        where: { slug: req.params.slug },
      });
      if (!gameClass) {
        res.status(404).json({ error: "Class not found" });
        return;
      }
      const passives = await prisma.classPassive.findMany({
        where: { classId: gameClass.id },
        orderBy: { rankRequired: "asc" },
      });
      res.json(passives);
    } catch (err) {
      next(err);
    }
  });

  // Character's current class data (equipped class + progress)
  app.get("/api/characters/:characterId/class", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const character = await prisma.character.findUnique({
        where: { id: req.params.characterId },
        include: {
          class: {
            include: {
              skills: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
              classPassives: { orderBy: { rankRequired: "asc" } },
              masteryBonuses: { orderBy: { rank: "asc" } },
            },
          },
          classProgress: {
            include: { gameClass: true },
            orderBy: { updatedAt: "desc" },
          },
          combatStats: true,
          activeBuffs: { include: { buff: true } },
          stacks: true,
        },
      });
      if (!character) {
        res.status(404).json({ error: "Character not found" });
        return;
      }
      if (character.userId !== req.user!.userId) {
        res.status(403).json({ error: "Not your character" });
        return;
      }
      res.json(character);
    } catch (err) {
      next(err);
    }
  });

  // Get all classes the character has unlocked with progress
  app.get("/api/characters/:characterId/classes", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const character = await prisma.character.findUnique({
        where: { id: req.params.characterId },
        select: { userId: true },
      });
      if (!character) {
        res.status(404).json({ error: "Character not found" });
        return;
      }
      if (character.userId !== req.user!.userId) {
        res.status(403).json({ error: "Not your character" });
        return;
      }

      const classProgress = await prisma.characterClass.findMany({
        where: { characterId: req.params.characterId },
        include: {
          gameClass: {
            include: {
              skills: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
              classPassives: { orderBy: { rankRequired: "asc" } },
              classUpgrades: { orderBy: { rankRequired: "asc" } },
              masteryBonuses: { orderBy: { rank: "asc" } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      res.json(classProgress);
    } catch (err) {
      next(err);
    }
  });

  // Equip / switch class for a character
  app.post("/api/characters/:characterId/class", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classId } = req.body;
      const character = await prisma.character.findUnique({
        where: { id: req.params.characterId },
      });
      if (!character) {
        res.status(404).json({ error: "Character not found" });
        return;
      }
      if (character.userId !== req.user!.userId) {
        res.status(403).json({ error: "Not your character" });
        return;
      }

      const gameClass = await prisma.gameClass.findUnique({
        where: { id: classId },
      });
      if (!gameClass || !gameClass.isActive) {
        res.status(404).json({ error: "Class not found" });
        return;
      }

      // Upsert CharacterClass progress entry
      await prisma.characterClass.upsert({
        where: {
          characterId_classId: { characterId: character.id, classId },
        },
        update: { isActive: true },
        create: { characterId: character.id, classId, isActive: true },
      });

      // Set all other class progress to inactive
      await prisma.characterClass.updateMany({
        where: { characterId: character.id, classId: { not: classId }, isActive: true },
        data: { isActive: false },
      });

      // Update character's current class
      const updated = await prisma.character.update({
        where: { id: character.id },
        data: { classId },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // Grant XP to a character's active class
  app.post("/api/characters/:characterId/class/xp", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { xpAmount } = req.body;
      const character = await prisma.character.findUnique({
        where: { id: req.params.characterId },
      });
      if (!character) {
        res.status(404).json({ error: "Character not found" });
        return;
      }
      if (character.userId !== req.user!.userId) {
        res.status(403).json({ error: "Not your character" });
        return;
      }

      const progress = await prisma.characterClass.findUnique({
        where: { characterId_classId: { characterId: character.id, classId: character.classId } },
      });
      if (!progress) {
        res.status(404).json({ error: "No class progress found" });
        return;
      }

      const { classExpForRank } = require("../../core/utils/experience");
      let newXp = Number(progress.experience) + xpAmount;
      let newRank = progress.rank;
      const maxRank = 10;

      while (newRank < maxRank) {
        const needed = classExpForRank(newRank);
        if (newXp >= needed) {
          newXp -= needed;
          newRank++;
        } else break;
      }

      const updated = await prisma.characterClass.update({
        where: { id: progress.id },
        data: { experience: BigInt(newXp), rank: newRank },
      });

      res.json({ rank: updated.rank, experience: Number(updated.experience), didLevelUp: newRank > progress.rank });
    } catch (err) {
      next(err);
    }
  });
}
