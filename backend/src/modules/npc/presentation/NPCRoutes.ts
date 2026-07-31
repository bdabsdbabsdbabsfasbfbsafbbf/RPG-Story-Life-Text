import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/npcs
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const npcs = await prisma.nPC.findMany({
      include: { shop: { include: { item: true } } },
    });
    res.json(npcs);
  } catch (error) {
    throw new AppError('Erro ao listar NPCs', 500);
  }
});

// GET /api/npcs/:slug
router.get('/:slug', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const npc = await prisma.nPC.findUnique({
      where: { slug: req.params.slug },
      include: { shop: { include: { item: true } } },
    });
    if (!npc) throw new AppError('NPC não encontrado', 404);
    res.json(npc);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao buscar NPC', 500);
  }
});

// POST /api/npcs/:slug/buy/:itemId
router.post('/:slug/buy/:itemId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slug, itemId } = req.params;
    const { quantity = 1 } = req.body;
    const playerId = req.playerId!;

    const shopItem = await prisma.nPCShop.findFirst({
      where: { npc: { slug }, itemId },
      include: { item: true },
    });

    if (!shopItem) throw new AppError('Item não disponível nesta loja', 404);

    const totalPrice = shopItem.price * quantity;
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new AppError('Jogador não encontrado', 404);

    if (shopItem.currency === 'GOLD' && player.gold < totalPrice) {
      throw new AppError('Gold insuficiente', 400);
    }

    // Deduct gold
    await prisma.player.update({
      where: { id: playerId },
      data: { gold: { decrement: totalPrice } },
    });

    // Add to inventory
    const existing = await prisma.playerInventory.findFirst({
      where: { playerId, itemId, equipped: false },
    });

    if (existing && shopItem.item.stackable) {
      await prisma.playerInventory.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await prisma.playerInventory.create({
        data: { playerId, itemId, quantity },
      });
    }

    res.json({ message: 'Compra realizada com sucesso' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao comprar item', 500);
  }
});

export default router;
