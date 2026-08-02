import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

// Starter items granted per class (matched by item name)
const STARTER_KITS: Record<string, { itemName: string; quantity: number }[]> = {
  cavaleiro: [
    { itemName: "Espada de Iniciante", quantity: 1 },
    { itemName: "Escudo de Madeira", quantity: 1 },
    { itemName: "Poção de Vida", quantity: 5 },
  ],
  mago: [
    { itemName: "Cajado do Aprendiz", quantity: 1 },
    { itemName: "Poção de Mana", quantity: 5 },
    { itemName: "Poção de Vida", quantity: 3 },
  ],
  assassino: [
    { itemName: "Adaga de Iniciante", quantity: 1 },
    { itemName: "Poção de Vida", quantity: 5 },
  ],
  suporte: [
    { itemName: "Cajado da Luz", quantity: 1 },
    { itemName: "Poção de Mana", quantity: 5 },
    { itemName: "Poção de Vida", quantity: 3 },
  ],
};

// Weight per rarity (rarer = harder to roll)
const RARITY_WEIGHTS: Record<string, number> = {
  comum: 50,
  incomum: 30,
  rara: 14,
  epica: 5,
  lendaria: 1,
};

function weightedPick<T extends { rarity?: string | null }>(items: T[]): T {
  const total = items.reduce(
    (sum, item) => sum + (RARITY_WEIGHTS[item.rarity ?? "comum"] ?? 10),
    0
  );
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= RARITY_WEIGHTS[item.rarity ?? "comum"] ?? 10;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export function createCharacterModule(app: Express): void {
  // Catalog (index) for the creation screen: races, traits and starter classes.
  // Races/traits grouped by rarity so the player can compare which is better.
  app.get("/api/characters/index", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [races, traits, classes] = await Promise.all([
        prisma.race.findMany({ where: { isActive: true }, orderBy: [{ rarity: "asc" }, { name: "asc" }] }),
        prisma.trait.findMany({ where: { isActive: true }, orderBy: [{ rarity: "asc" }, { name: "asc" }] }),
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

  // Roll: sorteia UMA raça OU um trait (separado, como antes).
  // Ponderado por raridade; consome o ticket correspondente.
  app.post("/api/characters/roll", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body ?? {};
      if (!["race", "trait"].includes(type)) throw new AppError(400, "Type must be 'race' or 'trait'");

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { raceRerolls: true, traitRerolls: true },
      });
      if (!user) throw new AppError(404, "User not found");

      if (type === "race") {
        if (user.raceRerolls <= 0) throw new AppError(400, "No race roll tickets remaining");
        const races = await prisma.race.findMany({ where: { isActive: true } });
        if (races.length === 0) throw new AppError(404, "No races available");
        const race = weightedPick(races);
        await prisma.user.update({
          where: { id: req.user!.userId },
          data: { raceRerolls: { decrement: 1 } },
        });
        res.json({ type: "race", result: race, ticketsLeft: user.raceRerolls - 1 });
      } else {
        if (user.traitRerolls <= 0) throw new AppError(400, "No trait roll tickets remaining");
        const traits = await prisma.trait.findMany({ where: { isActive: true } });
        if (traits.length === 0) throw new AppError(404, "No traits available");
        const trait = weightedPick(traits);
        await prisma.user.update({
          where: { id: req.user!.userId },
          data: { traitRerolls: { decrement: 1 } },
        });
        res.json({ type: "trait", result: trait, ticketsLeft: user.traitRerolls - 1 });
      }
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

        const kit = STARTER_KITS[gameClass.slug];
        if (kit && kit.length > 0) {
          const items = await tx.item.findMany({
            where: { name: { in: kit.map((k) => k.itemName) }, isActive: true },
          });
          for (const entry of kit) {
            const item = items.find((i) => i.name.toLowerCase() === entry.itemName.toLowerCase());
            if (!item) continue;
            const existing = await tx.inventory.findFirst({
              where: { userId: req.user!.userId, itemId: item.id, slotIndex: null },
            });
            if (existing) {
              await tx.inventory.update({
                where: { id: existing.id },
                data: { quantity: { increment: entry.quantity } },
              });
            } else {
              await tx.inventory.create({
                data: { userId: req.user!.userId, itemId: item.id, quantity: entry.quantity },
              });
            }
          }
        }

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
        include: {
          class: true,
          race: true,
          trait: true,
          combatStats: true,
          classProgress: {
            where: { isActive: true },
            include: { gameClass: { select: { id: true, name: true, slug: true, icon: true } } },
          },
        },
      });
      if (!character) return res.json(null);
      const xpToNext = character.level * 150;
      res.json({ ...character, xpToNext: Number(xpToNext), experience: Number(character.experience) });
    } catch (err) {
      next(err);
    }
  });

  // Rank up the active class using its class XP (rank max 10)
  app.post("/api/characters/rank-up", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const character = await prisma.character.findFirst({
        where: { userId: req.user!.userId },
        select: { id: true },
      });
      if (!character) throw new AppError(404, "Character not found");

      const progress = await prisma.characterClass.findFirst({
        where: { characterId: character.id, isActive: true },
      });
      if (!progress) throw new AppError(404, "Class progress not found");
      if (progress.rank >= 10) throw new AppError(400, "Already at max rank (10)");

      const xpNeeded = progress.rank * 150;
      if (Number(progress.experience) < xpNeeded) {
        throw new AppError(400, `Need ${xpNeeded} class XP to reach rank ${progress.rank + 1}`);
      }

      const updated = await prisma.characterClass.update({
        where: { id: progress.id },
        data: { rank: { increment: 1 }, experience: { decrement: BigInt(xpNeeded) } },
      });
      res.json({ rank: updated.rank, experience: Number(updated.experience), xpToNext: updated.rank * 150 });
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
