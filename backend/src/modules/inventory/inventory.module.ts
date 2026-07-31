import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

export function createInventoryModule(app: Express): void {
  app.get("/api/inventory", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await prisma.inventory.findMany({
        where: { userId: req.user!.userId },
        include: { item: true },
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
        include: { item: true },
      });
      res.json(equipped);
    } catch (err) {
      next(err);
    }
  });

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
      const validSlots = ["helmet", "chestplate", "pants", "boots", "gloves", "weapon", "shield", "amulet", "ring", "cape", "relic", "pet"];
      if (!validSlots.includes(itemType)) {
        throw new AppError(400, "Item cannot be equipped");
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

        // Update character equipment
        const equipmentData: any = {};
        const slotMap: any = {
          helmet: "helmetId",
          chestplate: "chestplateId",
          pants: "pantsId",
          boots: "bootsId",
          gloves: "glovesId",
          weapon: "weaponId",
          shield: "shieldId",
          amulet: "amuletId",
          ring: "ring1Id",
          cape: "capeId",
          relic: "relicId",
          pet: "petId",
        };
        const field = slotMap[itemType];
        if (field) {
          equipmentData[field] = inv.itemId;
          await tx.equipment.upsert({
            where: { characterId },
            create: { characterId, [field]: inv.itemId },
            update: { [field]: inv.itemId },
          });
        }
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

        const slotMap: any = {
          helmet: "helmetId",
          chestplate: "chestplateId",
          pants: "pantsId",
          boots: "bootsId",
          gloves: "glovesId",
          weapon: "weaponId",
          shield: "shieldId",
          amulet: "amuletId",
          ring: "ring1Id",
          cape: "capeId",
          relic: "relicId",
          pet: "petId",
        };
        const field = slotMap[inv.item.type];
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
