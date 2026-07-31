import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";

export function createEventsModule(app: Express): void {
  app.get("/api/events", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await prisma.gameEvent.findMany({
        where: { isActive: true },
        orderBy: { startsAt: "asc" },
      });
      res.json(events);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/events/active", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const active = await prisma.gameEvent.findMany({
        where: {
          isActive: true,
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
        orderBy: { endsAt: "asc" },
      });
      res.json(active);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const event = await prisma.gameEvent.findUnique({
        where: { id: req.params.id },
      });
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json(event);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/seasons", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const seasons = await prisma.season.findMany({
        where: { isActive: true },
        include: { tiers: { orderBy: { level: "asc" } } },
        orderBy: { startsAt: "desc" },
      });
      res.json(seasons);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/seasons/active", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const active = await prisma.season.findFirst({
        where: {
          isActive: true,
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
        include: { tiers: { orderBy: { level: "asc" } } },
      });
      res.json(active);
    } catch (err) {
      next(err);
    }
  });
}
