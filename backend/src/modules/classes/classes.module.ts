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

  // Character classes (player's owned classes)
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

  // Equip a class to a character (change class)
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

      const updated = await prisma.character.update({
        where: { id: character.id },
        data: { classId },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });
}
