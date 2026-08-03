import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";
import { addItemsToInventory, clampGold } from "../../core/progression";
import { getGameLimits } from "../../core/gameLimits";

export const PASS_XP_PER_LEVEL = 1000;

export function passLevelFromXp(xp: number): number {
  return 1 + Math.floor(Math.max(0, xp) / PASS_XP_PER_LEVEL);
}

export async function grantPassXp(db: any, userId: string, amount: number): Promise<void> {
  if (!amount || amount <= 0) return;
  const season = await db.season.findFirst({
    where: { isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
  });
  if (!season) return;
  const pass = await db.seasonPass.upsert({
    where: { seasonId_userId: { seasonId: season.id, userId } },
    update: { experience: { increment: amount } },
    create: { seasonId: season.id, userId, experience: amount },
  });
  const level = passLevelFromXp(Number(pass.experience) + amount);
  await db.seasonPass.update({ where: { id: pass.id }, data: { level } });
}

function parseList(raw: string | null): any[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createSeasonsModule(app: Express): void {
  app.get("/api/seasons/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const season = await prisma.season.findFirst({
        where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
        include: { tiers: { orderBy: { level: "asc" } } },
      });
      if (!season) {
        res.json({ season: null, tiers: [], pass: null });
        return;
      }
      const pass = await prisma.seasonPass.findUnique({
        where: { seasonId_userId: { seasonId: season.id, userId: req.user!.userId } },
      });
      res.json({
        season: {
          id: season.id,
          name: season.name,
          description: season.description,
          startsAt: season.startsAt,
          endsAt: season.endsAt,
        },
        tiers: season.tiers.map((t) => ({
          id: t.id,
          level: t.level,
          freeRewards: parseList(t.freeRewards),
          premiumRewards: parseList(t.premiumRewards),
        })),
        pass: pass
          ? {
              level: pass.level,
              experience: Number(pass.experience),
              isPremium: pass.isPremium,
              claimedTiers: parseList(pass.claimedTiers),
            }
          : null,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/seasons/active/claim/:tierId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const season = await prisma.season.findFirst({
        where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
      });
      if (!season) throw new AppError(404, "No active season");

      const tier = await prisma.seasonTier.findUnique({ where: { id: req.params.tierId } });
      if (!tier || tier.seasonId !== season.id) throw new AppError(404, "Tier not found");

      let pass = await prisma.seasonPass.findUnique({
        where: { seasonId_userId: { seasonId: season.id, userId: req.user!.userId } },
      });
      if (!pass) {
        pass = await prisma.seasonPass.create({
          data: { seasonId: season.id, userId: req.user!.userId, experience: 0 },
        });
      }

      if (passLevelFromXp(Number(pass.experience)) < tier.level) {
        throw new AppError(400, `Requer nível ${tier.level} do passe para reivindicar`);
      }
      const claimed: string[] = parseList(pass.claimedTiers);
      if (claimed.includes(tier.id)) throw new AppError(400, "Tier já reivindicado");

      const rewards = parseList(pass.isPremium ? tier.premiumRewards : tier.freeRewards);
      const limits = await getGameLimits();
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

      await prisma.$transaction(async (tx) => {
        await tx.seasonPass.update({
          where: { id: pass!.id },
          data: { claimedTiers: JSON.stringify([...claimed, tier.id]) },
        });
        for (const r of rewards) {
          const type = r?.type;
          if (type === "gold") {
            const gain = clampGold(user?.gold ?? 0n, Number(r.value || 0), BigInt(limits.maxGold));
            await tx.user.update({
              where: { id: req.user!.userId },
              data: { gold: { increment: gain } },
            });
          } else if (type === "experience") {
            await tx.user.update({
              where: { id: req.user!.userId },
              data: { experience: { increment: Number(r.value || 0) } },
            });
          } else if (type === "item") {
            const name = r.slug ?? r.itemName ?? r.name;
            if (name) {
              await addItemsToInventory(tx, req.user!.userId, [
                { itemName: name, quantity: Number(r.quantity || 1) },
              ]);
            }
          } else if (type === "classXp") {
            const cp = await tx.characterClass.findFirst({
              where: { character: { userId: req.user!.userId }, isActive: true },
            });
            if (cp) {
              await tx.characterClass.update({
                where: { id: cp.id },
                data: { experience: { increment: Number(r.value || 0) } },
              });
            }
          }
        }
      });

      res.json({ message: "Tier reivindicado", tierId: tier.id, rewards });
    } catch (err) {
      next(err);
    }
  });
}
