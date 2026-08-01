import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

export function createCharacterModule(app: Express): void {
  // Catalog (index) for the creation screen: races, traits and starter classes
  app.get("/api/characters/index", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [races, traits, classes] = await Promise.all([
        prisma.race.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
        prisma.trait.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
        prisma.gameClass.findMany({
          where: { isActive: true, isStarter: true },
          orderBy: { name: "asc" },
        }),
      ]);
      res.json({ races, traits, classes });
    } catch (err) {
      next(err);
    }
  });

  // Roll random options for a race or trait (consumes one ticket, max 3 each)
  app.post("/api/characters/roll", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      if (type !== "race" && type !== "trait") {
        throw new AppError(400, "Invalid roll type (must be 'race' or 'trait')");
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { raceRerolls: true, traitRerolls: true },
      });
      if (!user) throw new AppError(404, "User not found");

      const field = type === "race" ? "raceRerolls" : "traitRerolls";
      if (user[field] <= 0) throw new AppError(400, "No tickets remaining for this roll");

      let available: { id: string; name: string; slug: string; description: string }[] = [];
      if (type === "race") {
        available = await prisma.race.findMany({ where: { isActive: true } });
      } else {
        available = await prisma.trait.findMany({ where: { isActive: true } });
      }
      if (available.length === 0) throw new AppError(404, `No ${type}s available`);

      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const options = shuffled.slice(0, Math.min(3, shuffled.length));

      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { [field]: { decrement: 1 } },
      });

      res.json({ type, options, ticketsLeft: user[field] - 1 });
    } catch (err) {
      next(err);
    }
  });

  // Create the player's character
  app.post("/api/characters", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, classId, raceId, traitId } = req.body;
      if (!name || typeof name !== "string" || !name.trim()) {
        throw new AppError(400, "Character name required");
      }
      if (!classId) throw new AppError(400, "Class required");

      const existing = await prisma.character.findFirst({ where: { userId: req.user!.userId } });
      if (existing) throw new AppError(409, "You already have a character");

      const gameClass = await prisma.gameClass.findFirst({
        where: { id: classId, isActive: true },
      });
      if (!gameClass) throw new AppError(404, "Class not found");
      if (!gameClass.isStarter) {
        throw new AppError(400, "This class is not available for new characters");
      }

      const [race, trait] = await Promise.all([
        raceId ? prisma.race.findFirst({ where: { id: raceId, isActive: true } }) : null,
        traitId ? prisma.trait.findFirst({ where: { id: traitId, isActive: true } }) : null,
      ]);
      if (raceId && !race) throw new AppError(404, "Race not found");
      if (traitId && !trait) throw new AppError(404, "Trait not found");

      const character = await prisma.$transaction(async (tx) => {
        const created = await tx.character.create({
          data: {
            userId: req.user!.userId,
            name: name.trim().slice(0, 50),
            classId: gameClass.id,
            raceId: race?.id ?? null,
            traitId: trait?.id ?? null,
            currentHp: gameClass.baseHp,
            currentMana: gameClass.baseMana,
          },
          include: {
            class: { select: { id: true, name: true, slug: true } },
            race: true,
            trait: true,
          },
        });
        await tx.characterClass.create({
          data: { characterId: created.id, classId: gameClass.id, isActive: true },
        });
        return created;
      });

      res.status(201).json(character);
    } catch (err) {
      next(err);
    }
  });

  // Current user's character
  app.get("/api/characters/my", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const character = await prisma.character.findFirst({
        where: { userId: req.user!.userId },
        include: { class: true, race: true, trait: true, combatStats: true },
      });
      res.json(character);
    } catch (err) {
      next(err);
    }
  });

  // Remaining roll tickets
  app.get("/api/characters/tickets", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { raceRerolls: true, traitRerolls: true },
      });
      res.json(user);
    } catch (err) {
      next(err);
    }
  });
}
