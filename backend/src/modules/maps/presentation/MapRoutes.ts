import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/maps
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const maps = await prisma.map.findMany({
      include: {
        portals: true,
        monsters: { include: { monster: true } },
        npcs: { include: { npc: true } },
      },
    });
    res.json(maps);
  } catch (error) {
    throw new AppError('Erro ao listar mapas', 500);
  }
});

// GET /api/maps/:slug
router.get('/:slug', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const map = await prisma.map.findUnique({
      where: { slug: req.params.slug },
      include: {
        portals: { include: { targetMap: true } },
        monsters: { include: { monster: true } },
        npcs: { include: { npc: true } },
      },
    });
    if (!map) throw new AppError('Mapa não encontrado', 404);
    res.json(map);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao buscar mapa', 500);
  }
});

export default router;
