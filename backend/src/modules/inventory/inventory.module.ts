import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

const EQUIP_SLOTS = ["weapon", "class", "helm", "armor", "cape", "ring", "necklace"] as const;

const SLOT_MAP: Record<string, string> = {
  weapon: "weaponId",
  class: "classItemId",
  helm: "helmId",
  armor: "armorId",
  cape: "capeId",
  ring: "ringId",
  necklace: "necklaceId",
};

function parseSlots(raw: string | null): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function createInventoryModule(app: Express): void {
  app.get("/api/inventory", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await prisma.inventory.findMany({
        where: { userId: req.user!.userId },
        include: { item: { include: { enchantment: true } } },
        orderBy: { acquiredAt: "desc" },
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/inventory/equipped", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipped = await prisma.inventory.findMany({
        where: { userId: req.user!.userId, isEquipped: true },
        include: { item: { include: { enchantment: true } } },
      });
      res.json(equipped);
    } catch (err) {
      next(err);
    }
  });

  // Equipa um item no slot correspondente ao seu tipo
  app.post("/api/inventory/equip", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inventoryId, characterId } = req.body;
      const inv = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { item: true },
      });
      if (!inv || inv.userId !== req.user!.userId) {
        throw new AppError(404, "Item not found in inventory");
      }

      const itemType = inv.item.type;
      if (!EQUIP_SLOTS.includes(itemType as any)) {
        throw new AppError(400, "Item cannot be equipped");
      }

      // Item exclusivo para VIP
      if (inv.item.requiredVip) {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          select: { vipOwned: true },
        });
        if (!user?.vipOwned) {
          throw new AppError(403, "Este item é exclusivo para VIP.");
        }
      }

      await prisma.$transaction(async (tx) => {
        // Unequip any item in the same slot
        const existingEquipped = await tx.inventory.findFirst({
          where: {
            userId: req.user!.userId,
            isEquipped: true,
            item: { type: itemType },
          },
          include: { item: true },
        });
        if (existingEquipped) {
          await tx.inventory.update({
            where: { id: existingEquipped.id },
            data: { isEquipped: false },
          });
        }

        await tx.inventory.update({
          where: { id: inventoryId },
          data: { isEquipped: true },
        });

        const field = SLOT_MAP[itemType];
        await tx.equipment.upsert({
          where: { characterId },
          create: { characterId, [field]: inv.itemId },
          update: { [field]: inv.itemId },
        });
      });

      res.json({ message: "Item equipped" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/inventory/unequip", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inventoryId, characterId } = req.body;
      const inv = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { item: true },
      });
      if (!inv || inv.userId !== req.user!.userId) {
        throw new AppError(404, "Item not found");
      }

      await prisma.$transaction(async (tx) => {
        await tx.inventory.update({
          where: { id: inventoryId },
          data: { isEquipped: false },
        });

        const field = SLOT_MAP[inv.item.type];
        if (field) {
          await tx.equipment.update({
            where: { characterId },
            data: { [field]: null },
          });
        }
      });

      res.json({ message: "Item unequipped" });
    } catch (err) {
      next(err);
    }
  });

  // Encantamentos que o jogador possui
  app.get("/api/inventory/enchantments", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owned = await prisma.userEnchantment.findMany({
        where: { userId: req.user!.userId },
        include: { enchantment: true },
        orderBy: { acquiredAt: "desc" },
      });
      res.json(owned);
    } catch (err) {
      next(err);
    }
  });

  // Aplica (ou troca) um encantamento em um item equipável compatível
  app.post("/api/inventory/enchant", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inventoryId, enchantmentId } = req.body;
      const inv = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { item: true },
      });
      if (!inv || inv.userId !== req.user!.userId) {
        throw new AppError(404, "Item not found in inventory");
      }
      if (!EQUIP_SLOTS.includes(inv.item.type as any)) {
        throw new AppError(400, "Este item não aceita encantamentos");
      }

      const enchantment = await prisma.enchantment.findUnique({ where: { id: enchantmentId } });
      if (!enchantment || !enchantment.isActive) {
        throw new AppError(404, "Encantamento não encontrado");
      }
      // Encantamento exclusivo para VIP
      if (enchantment.requiredVip) {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          select: { vipOwned: true },
        });
        if (!user?.vipOwned) {
          throw new AppError(403, "Este encantamento é exclusivo para VIP.");
        }
      }
      if (inv.item.rank < (enchantment.minRank || 1)) {
        throw new AppError(400, `Encantamento requer item de rank ${enchantment.minRank}`);
      }
      const compatible = parseSlots(enchantment.compatibleSlots);
      if (compatible.length > 0 && !compatible.includes(inv.item.type)) {
        throw new AppError(400, "Encantamento incompatível com este item");
      }

      await prisma.$transaction(async (tx) => {
        const owned = await tx.userEnchantment.findUnique({
          where: { userId_enchantmentId: { userId: req.user!.userId, enchantmentId } },
        });
        if (!owned || owned.quantity < 1) {
          throw new AppError(400, "Você não possui este encantamento");
        }

        // Troca: devolve o encantamento antigo para o jogador
        const oldEnchantmentId = inv.item.enchantmentId;
        if (oldEnchantmentId && oldEnchantmentId !== enchantmentId) {
          await tx.userEnchantment.upsert({
            where: { userId_enchantmentId: { userId: req.user!.userId, enchantmentId: oldEnchantmentId } },
            create: { userId: req.user!.userId, enchantmentId: oldEnchantmentId, quantity: 1 },
            update: { quantity: { increment: 1 } },
          });
        }

        await tx.userEnchantment.update({
          where: { userId_enchantmentId: { userId: req.user!.userId, enchantmentId } },
          data: { quantity: { decrement: 1 } },
        });

        await tx.item.update({
          where: { id: inv.itemId },
          data: { enchantmentId },
        });
      });

      res.json({ message: "Encantamento aplicado!" });
    } catch (err) {
      next(err);
    }
  });

  // Remove o encantamento do item, devolvendo-o ao jogador
  app.post("/api/inventory/enchant/remove", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inventoryId } = req.body;
      const inv = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { item: true },
      });
      if (!inv || inv.userId !== req.user!.userId) {
        throw new AppError(404, "Item not found in inventory");
      }
      const enchantmentId = inv.item.enchantmentId;
      if (!enchantmentId) {
        throw new AppError(400, "Item sem encantamento");
      }

      await prisma.$transaction(async (tx) => {
        await tx.item.update({
          where: { id: inv.itemId },
          data: { enchantmentId: null },
        });
        await tx.userEnchantment.upsert({
          where: { userId_enchantmentId: { userId: req.user!.userId, enchantmentId } },
          create: { userId: req.user!.userId, enchantmentId, quantity: 1 },
          update: { quantity: { increment: 1 } },
        });
      });

      res.json({ message: "Encantamento removido" });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/inventory/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inv = await prisma.inventory.findUnique({
        where: { id: req.params.id },
      });
      if (!inv || inv.userId !== req.user!.userId) {
        throw new AppError(404, "Item not found");
      }
      await prisma.inventory.delete({ where: { id: req.params.id } });
      res.json({ message: "Item deleted" });
    } catch (err) {
      next(err);
    }
  });
}
