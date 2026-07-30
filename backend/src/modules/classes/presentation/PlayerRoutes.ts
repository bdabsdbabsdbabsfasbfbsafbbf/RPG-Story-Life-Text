import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/players/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: req.playerId! },
      include: {
        stats: true,
        equipment: { include: { item: true } },
        classes: { include: { class: true }, where: { isActive: true } },
        server: true,
        map: true,
      },
    });
    if (!player) throw new AppError('Jogador não encontrado', 404);
    res.json(player);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao buscar jogador', 500);
  }
});

// PATCH /api/players/position
router.patch('/position', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { x, y, mapId } = req.body;
    const player = await prisma.player.update({
      where: { id: req.playerId! },
      data: { x, y, mapId },
    });
    res.json(player);
  } catch (error) {
    throw new AppError('Erro ao atualizar posição', 500);
  }
});

export default router;
