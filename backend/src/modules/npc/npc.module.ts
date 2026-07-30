import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../server";

export function createNpcModule(app: Express): void {
  app.get("/api/npcs", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, mapId } = req.query;
      const where: any = {};
      if (type) where.type = type;
      if (mapId) where.mapNpcs = { some: { mapId: mapId as string } };

      const npcs = await prisma.npc.findMany({
        where,
        include: {
          mapNpcs: { include: { map: { select: { name: true, slug: true } } } },
          shopItems: { include: { item: true } },
          quests: true,
        },
      });
      res.json(npcs);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/npcs/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const npc = await prisma.npc.findUnique({
        where: { id: req.params.id },
        include: {
          shopItems: { include: { item: true } },
          quests: true,
          mapNpcs: { include: { map: true } },
        },
      });
      if (!npc) {
        res.status(404).json({ error: "NPC not found" });
        return;
      }
      res.json(npc);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/npcs/:id/shop", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shop = await prisma.shopItem.findMany({
        where: { npcId: req.params.id },
        include: { item: true },
      });
      res.json(shop);
    } catch (err) {
      next(err);
    }
  });
}
