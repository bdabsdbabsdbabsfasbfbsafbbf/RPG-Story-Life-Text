import { Express, Request, Response, NextFunction } from "express";
import { prisma } from "../../core/database";
import { authenticate } from "../../core/middleware/auth";
import { AppError } from "../../core/middleware/errorHandler";

export function createMarketModule(app: Express): void {
  app.get("/api/market", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, rarity, minPrice, maxPrice, search, page = "1", limit = "20" } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = { status: "active" };
      if (type) where.item = { type: type as string };
      if (rarity) where.item = { ...where.item, rarity: rarity as string };
      if (search) where.item = { ...where.item, name: { contains: search as string, mode: "insensitive" } };
      if (minPrice) where.price = { gte: BigInt(minPrice as string) };
      if (maxPrice) where.price = { ...where.price, lte: BigInt(maxPrice as string) };

      const [listings, total] = await Promise.all([
        prisma.marketListing.findMany({
          where,
          include: {
            item: true,
            seller: { select: { username: true, displayName: true } },
          },
          skip,
          take: parseInt(limit as string),
          orderBy: { price: "asc" },
        }),
        prisma.marketListing.count({ where }),
      ]);

      res.json({ listings, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/market/my", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listings = await prisma.marketListing.findMany({
        where: { sellerId: req.user!.userId },
        include: { item: true },
        orderBy: { createdAt: "desc" },
      });
      res.json(listings);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/market/sell", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inventoryId, price } = req.body;
      const quantity = Math.max(1, Math.floor(Number(req.body.quantity) || 1));
      if (!inventoryId || !price) throw new AppError(400, "Inventory item and price required");
      if (price <= 0) throw new AppError(400, "Price must be positive");

      const inv = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { item: true },
      });
      if (!inv || inv.userId !== req.user!.userId) throw new AppError(404, "Item not found");
      if (!inv.item.isTradable) throw new AppError(400, "Item is not tradable");
      if (inv.isEquipped) throw new AppError(400, "Cannot sell equipped item");
      if (quantity > inv.quantity) throw new AppError(400, "Not enough quantity");

      await prisma.$transaction(async (tx) => {
        if (quantity >= inv.quantity) {
          await tx.inventory.delete({ where: { id: inventoryId } });
        } else {
          await tx.inventory.update({
            where: { id: inventoryId },
            data: { quantity: { decrement: quantity } },
          });
        }
        await tx.marketListing.create({
          data: {
            sellerId: req.user!.userId,
            itemId: inv.itemId,
            quantity,
            price: BigInt(price),
            status: "active",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      });

      res.status(201).json({ message: "Item listed for sale" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/market/sell-now", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inventoryId } = req.body;
      const quantity = Math.max(1, Math.floor(Number(req.body.quantity) || 1));
      if (!inventoryId) throw new AppError(400, "Inventory item required");

      const inv = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { item: true },
      });
      if (!inv || inv.userId !== req.user!.userId) throw new AppError(404, "Item not found");
      if (!inv.item.isSellable) throw new AppError(400, "Item cannot be sold");
      if (inv.isEquipped) throw new AppError(400, "Cannot sell equipped item");
      if (quantity > inv.quantity) throw new AppError(400, "Not enough quantity");

      const gold = inv.item.sellPrice * BigInt(quantity);

      await prisma.$transaction(async (tx) => {
        if (quantity >= inv.quantity) {
          await tx.inventory.delete({ where: { id: inventoryId } });
        } else {
          await tx.inventory.update({
            where: { id: inventoryId },
            data: { quantity: { decrement: quantity } },
          });
        }
        await tx.user.update({
          where: { id: req.user!.userId },
          data: { gold: { increment: gold } },
        });
      });

      res.json({ message: "Item sold", gold: gold.toString() });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/market/buy/:listingId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listing = await prisma.marketListing.findUnique({
        where: { id: req.params.listingId },
        include: { item: true },
      });
      if (!listing || listing.status !== "active") throw new AppError(404, "Listing not found");
      if (listing.sellerId === req.user!.userId) throw new AppError(400, "Cannot buy your own item");

      const buyer = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      if (!buyer || buyer.gold < listing.price) throw new AppError(400, "Not enough gold");

      await prisma.$transaction(async (tx) => {
        await tx.marketListing.update({
          where: { id: listing.id },
          data: { status: "sold" },
        });

        await tx.user.update({
          where: { id: req.user!.userId },
          data: { gold: { decrement: listing.price } },
        });

        await tx.user.update({
          where: { id: listing.sellerId },
          data: { gold: { increment: listing.price } },
        });

        await tx.inventory.create({
          data: {
            userId: req.user!.userId,
            itemId: listing.itemId,
            quantity: listing.quantity,
          },
        });
      });

      res.json({ message: "Item purchased" });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/market/:listingId/cancel", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listing = await prisma.marketListing.findUnique({
        where: { id: req.params.listingId },
      });
      if (!listing || listing.sellerId !== req.user!.userId) throw new AppError(404, "Listing not found");

      await prisma.$transaction(async (tx) => {
        await tx.marketListing.update({
          where: { id: listing.id },
          data: { status: "cancelled" },
        });
        await tx.inventory.create({
          data: {
            userId: req.user!.userId,
            itemId: listing.itemId,
            quantity: listing.quantity,
          },
        });
      });

      res.json({ message: "Listing cancelled" });
    } catch (err) {
      next(err);
    }
  });
}
