import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { withEnchantmentStats } from "../../core/enchantments/enchantmentStats";

export function createItemsModule(app: Express): void {
  app.get("/api/enchantments", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const enchantments = await prisma.enchantment.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });
      res.json(enchantments.map(withEnchantmentStats));
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/items", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, rarity, level, search, page = "1", limit = "20" } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = { isActive: true };
      if (type) where.type = type;
      if (rarity) where.rarity = rarity;
      if (level) where.level = { lte: parseInt(level as string) };
      if (search) where.name = { contains: search as string, mode: "insensitive" };

      const [items, total] = await Promise.all([
        prisma.item.findMany({
          where,
          skip,
          take: parseInt(limit as string),
          orderBy: { name: "asc" },
        }),
        prisma.item.count({ where }),
      ]);

      res.json({ items, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/items/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await prisma.item.findUnique({
        where: { id: req.params.id },
        include: {
          enchantment: true,
        },
      });
      if (!item) {
        res.status(404).json({ error: "Item not found" });
        return;
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  });
}
