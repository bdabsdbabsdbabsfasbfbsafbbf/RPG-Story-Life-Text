import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/classes
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        ranks: { orderBy: { rankNumber: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(classes);
  } catch (error) {
    throw new AppError('Erro ao listar classes', 500);
  }
});

// GET /api/classes/:slug
router.get('/:slug', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const classData = await prisma.class.findUnique({
      where: { slug: req.params.slug },
      include: {
        ranks: { orderBy: { rankNumber: 'asc' } },
        skills: {
          include: { effects: true },
          orderBy: { rankRequired: 'asc' },
        },
      },
    });
    if (!classData) throw new AppError('Classe não encontrada', 404);
    res.json(classData);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao buscar classe', 500);
  }
});

// POST /api/classes/:classId/equip
router.post('/:classId/equip', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const playerId = req.playerId!;
    const { classId } = req.params;

    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) throw new AppError('Classe não encontrada', 404);

    const playerClass = await prisma.playerClass.findFirst({
      where: { playerId, classId },
    });

    if (!playerClass) {
      await prisma.playerClass.create({
        data: { playerId, classId, isActive: true },
      });
    } else {
      await prisma.playerClass.updateMany({
        where: { playerId, isActive: true },
        data: { isActive: false },
      });
      await prisma.playerClass.update({
        where: { id: playerClass.id },
        data: { isActive: true },
      });
    }

    res.json({ message: 'Classe equipada com sucesso' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao equipar classe', 500);
  }
});

// GET /api/players/classes
router.get('/player/classes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const playerClasses = await prisma.playerClass.findMany({
      where: { playerId: req.playerId! },
      include: {
        class: {
          include: { ranks: { orderBy: { rankNumber: 'asc' } } },
        },
      },
    });
    res.json(playerClasses);
  } catch (error) {
    throw new AppError('Erro ao listar classes do jogador', 500);
  }
});

export default router;
