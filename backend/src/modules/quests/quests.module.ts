import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../server";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

export function createQuestsModule(app: Express): void {
  app.get("/api/quests", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, mapId } = req.query;
      const where: any = { isActive: true };
      if (type) where.type = type;
      if (mapId) where.mapId = mapId;

      const quests = await prisma.quest.findMany({
        where,
        include: { giverNpc: { select: { name: true } }, map: { select: { name: true } } },
        orderBy: { sortOrder: "asc" },
      });
      res.json(quests);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/quests/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quest = await prisma.quest.findUnique({
        where: { id: req.params.id },
        include: { giverNpc: true, map: true },
      });
      if (!quest) {
        res.status(404).json({ error: "Quest not found" });
        return;
      }
      res.json(quest);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/quests/:id/accept", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quest = await prisma.quest.findUnique({ where: { id: req.params.id } });
      if (!quest) throw new AppError(404, "Quest not found");

      const existing = await prisma.questProgress.findUnique({
        where: { userId_questId: { userId: req.user!.userId, questId: req.params.id } },
      });
      if (existing) throw new AppError(400, "Quest already accepted or completed");

      const progress = await prisma.questProgress.create({
        data: {
          userId: req.user!.userId,
          questId: req.params.id,
          status: "active",
          progress: "{}",
        },
      });

      res.json(progress);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/quests/progress", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const progress = await prisma.questProgress.findMany({
        where: { userId: req.user!.userId },
        include: { quest: true },
        orderBy: { startedAt: "desc" },
      });
      res.json(progress);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/quests/:id/claim", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const progress = await prisma.questProgress.findUnique({
        where: { userId_questId: { userId: req.user!.userId, questId: req.params.id } },
        include: { quest: true },
      });
      if (!progress) throw new AppError(404, "Quest progress not found");
      if (progress.status !== "completed") throw new AppError(400, "Quest not completed");
      if (progress.claimedAt) throw new AppError(400, "Rewards already claimed");

      await prisma.$transaction(async (tx) => {
        await tx.questProgress.update({
          where: { id: progress.id },
          data: { status: "claimed", claimedAt: new Date() },
        });

        await tx.user.update({
          where: { id: req.user!.userId },
          data: {
            experience: { increment: Number(progress.quest.xpReward) },
            gold: { increment: Number(progress.quest.goldReward) },
          },
        });
      });

      res.json({ message: "Rewards claimed" });
    } catch (err) {
      next(err);
    }
  });
}
