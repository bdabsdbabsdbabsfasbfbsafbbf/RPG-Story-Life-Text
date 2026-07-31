import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/inventory
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.playerInventory.findMany({
      where: { playerId: req.playerId!, equipped: false },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    throw new AppError('Erro ao listar inventário', 500);
  }
});

// GET /api/inventory/equipped
router.get('/equipped', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const equipped = await prisma.playerEquipment.findMany({
      where: { playerId: req.playerId! },
      include: { item: true },
    });
    res.json(equipped);
  } catch (error) {
    throw new AppError('Erro ao listar equipamentos', 500);
  }
});

// POST /api/inventory/equip
router.post('/equip', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { inventoryId, slot } = req.body;
    const playerId = req.playerId!;

    const inventoryItem = await prisma.playerInventory.findUnique({
      where: { id: inventoryId },
      include: { item: true },
    });

    if (!inventoryItem || inventoryItem.playerId !== playerId) {
      throw new AppError('Item não encontrado no inventário', 404);
    }

    // Unequip existing item in slot
    await prisma.playerEquipment.deleteMany({
      where: { playerId, slot },
    });

    // Equip new item
    await prisma.playerEquipment.create({
      data: { playerId, slot, itemId: inventoryItem.itemId },
    });

    // Remove from inventory
    await prisma.playerInventory.delete({ where: { id: inventoryId } });

    res.json({ message: 'Item equipado com sucesso' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao equipar item', 500);
  }
});

// POST /api/inventory/unequip
router.post('/unequip', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { slot } = req.body;
    const playerId = req.playerId!;

    const equipment = await prisma.playerEquipment.findFirst({
      where: { playerId, slot },
    });

    if (!equipment) throw new AppError('Nada equipado neste slot', 404);

    // Return to inventory
    await prisma.playerInventory.create({
      data: { playerId, itemId: equipment.itemId, equipped: false },
    });

    await prisma.playerEquipment.delete({ where: { id: equipment.id } });

    res.json({ message: 'Item desequipado' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao desequipar item', 500);
  }
});

// POST /api/inventory/use/:inventoryId
router.post('/use/:inventoryId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const inventoryItem = await prisma.playerInventory.findUnique({
      where: { id: req.params.inventoryId },
      include: { item: true },
    });

    if (!inventoryItem || inventoryItem.playerId !== req.playerId!) {
      throw new AppError('Item não encontrado', 404);
    }

    if (inventoryItem.item.type === 'CONSUMABLE') {
      // Apply consumable effects
      if (inventoryItem.item.slug === 'health-potion') {
        await prisma.player.update({
          where: { id: req.playerId! },
          data: { hp: { increment: 100 } },
        });
      } else if (inventoryItem.item.slug === 'mana-potion') {
        await prisma.player.update({
          where: { id: req.playerId! },
          data: { mana: { increment: 50 } },
        });
      }

      if (inventoryItem.quantity > 1) {
        await prisma.playerInventory.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: 1 } },
        });
      } else {
        await prisma.playerInventory.delete({ where: { id: inventoryItem.id } });
      }

      res.json({ message: 'Item usado com sucesso' });
    } else {
      throw new AppError('Este item não pode ser usado', 400);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao usar item', 500);
  }
});

export default router;
