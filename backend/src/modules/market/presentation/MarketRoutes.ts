import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/market
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { type, rarity, minLevel, maxLevel, minPrice, maxPrice } = req.query;
    const where: any = { status: 'ACTIVE' };

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice as string);
      if (maxPrice) where.price.lte = parseInt(maxPrice as string);
    }

    const listings = await prisma.marketListing.findMany({
      where,
      include: {
        item: true,
        seller: { select: { id: true, username: true, level: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(listings);
  } catch (error) {
    throw new AppError('Erro ao listar mercado', 500);
  }
});

// POST /api/market/sell
router.post('/sell', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { inventoryId, price, currency = 'GOLD', quantity = 1 } = req.body;
    const playerId = req.playerId!;

    const invItem = await prisma.playerInventory.findUnique({
      where: { id: inventoryId },
      include: { item: true },
    });

    if (!invItem || invItem.playerId !== playerId) {
      throw new AppError('Item não encontrado no inventário', 404);
    }

    if (!invItem.item.isTradable) {
      throw new AppError('Este item não pode ser negociado', 400);
    }

    await prisma.marketListing.create({
      data: {
        sellerId: playerId,
        itemId: invItem.itemId,
        quantity,
        price,
        currency,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    if (invItem.quantity > quantity) {
      await prisma.playerInventory.update({
        where: { id: inventoryId },
        data: { quantity: { decrement: quantity } },
      });
    } else {
      await prisma.playerInventory.delete({ where: { id: inventoryId } });
    }

    res.json({ message: 'Item listado no mercado' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao listar item', 500);
  }
});

// POST /api/market/buy/:listingId
router.post('/buy/:listingId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.marketListing.findUnique({
      where: { id: req.params.listingId },
      include: { item: true },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      throw new AppError('Anúncio não encontrado ou expirado', 404);
    }

    if (listing.sellerId === req.playerId!) {
      throw new AppError('Você não pode comprar seu próprio item', 400);
    }

    const buyer = await prisma.player.findUnique({ where: { id: req.playerId! } });
    if (!buyer) throw new AppError('Jogador não encontrado', 404);

    if (listing.currency === 'GOLD' && buyer.gold < listing.price) {
      throw new AppError('Gold insuficiente', 400);
    }

    // Transfer gold to seller
    await prisma.player.update({
      where: { id: listing.sellerId },
      data: { gold: { increment: listing.price } },
    });

    await prisma.player.update({
      where: { id: req.playerId! },
      data: { gold: { decrement: listing.price } },
    });

    // Transfer item to buyer
    const existingItem = await prisma.playerInventory.findFirst({
      where: { playerId: req.playerId!, itemId: listing.itemId, equipped: false },
    });

    if (existingItem && listing.item.stackable) {
      await prisma.playerInventory.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: listing.quantity } },
      });
    } else {
      await prisma.playerInventory.create({
        data: { playerId: req.playerId!, itemId: listing.itemId, quantity: listing.quantity },
      });
    }

    await prisma.marketListing.update({
      where: { id: listing.id },
      data: { status: 'SOLD' },
    });

    res.json({ message: 'Item comprado com sucesso!' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao comprar item', 500);
  }
});

export default router;
