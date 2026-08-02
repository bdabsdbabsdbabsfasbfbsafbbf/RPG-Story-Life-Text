import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

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

  // Buy an item from the NPC vendor (debita gold e adiciona ao inventário)
  app.post("/api/npcs/:id/buy", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId, quantity = 1 } = req.body;
      if (!itemId) throw new AppError(400, "itemId required");
      const qty = Math.max(1, Math.floor(Number(quantity) || 1));

      const shopOffer = await prisma.shopItem.findFirst({
        where: { npcId: req.params.id, itemId },
        include: { item: true },
      });
      if (!shopOffer) throw new AppError(404, "Item not sold by this NPC");

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, gold: true },
      });
      if (!user) throw new AppError(404, "User not found");

      const totalPrice = Number(shopOffer.price) * qty;
      if (Number(user.gold) < totalPrice) {
        throw new AppError(400, `Not enough gold (need ${totalPrice})`);
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { gold: { decrement: totalPrice } },
        });
        const existing = await tx.inventory.findFirst({
          where: { userId: user.id, itemId, slotIndex: null },
        });
        if (existing) {
          await tx.inventory.update({
            where: { id: existing.id },
            data: { quantity: { increment: qty } },
          });
        } else {
          await tx.inventory.create({
            data: { userId: user.id, itemId, quantity: qty },
          });
        }
      });

      res.json({
        item: shopOffer.item.name,
        quantity: qty,
        totalPrice,
        goldLeft: Math.max(0, Number(user.gold) - totalPrice),
      });
    } catch (err) {
      next(err);
    }
  });
}
