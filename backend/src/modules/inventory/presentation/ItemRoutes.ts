import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/items
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { type, rarity, minLevel, maxLevel } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (rarity) where.rarity = rarity;
    if (minLevel) where.level = { gte: parseInt(minLevel as string) };
    if (maxLevel) where.level = { ...where.level, lte: parseInt(maxLevel as string) };

    const items = await prisma.item.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json(items);
  } catch (error) {
    throw new AppError('Erro ao listar itens', 500);
  }
});

// GET /api/items/:slug
router.get('/:slug', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.item.findUnique({
      where: { slug: req.params.slug },
      include: { stats: true, effects: true },
    });
    if (!item) throw new AppError('Item não encontrado', 404);
    res.json(item);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao buscar item', 500);
  }
});

export default router;
