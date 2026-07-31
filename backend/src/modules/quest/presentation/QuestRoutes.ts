import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/quests
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { type, mapId } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (mapId) where.mapId = mapId;

    const quests = await prisma.quest.findMany({
      where: { ...where, levelRequirement: { lte: (await prisma.player.findUnique({ where: { id: req.playerId! }, select: { level: true } }))?.level || 1 } },
      include: { objectives: true },
    });
    res.json(quests);
  } catch (error) {
    throw new AppError('Erro ao listar missões', 500);
  }
});

// POST /api/quests/:questId/accept
router.post('/:questId/accept', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const playerId = req.playerId!;
    const { questId } = req.params;

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw new AppError('Missão não encontrada', 404);

    const existing = await prisma.playerQuest.findFirst({
      where: { playerId, questId, status: { in: ['ACTIVE', 'COMPLETED'] } },
    });

    if (existing) throw new AppError('Missão já aceita ou concluída', 400);

    await prisma.playerQuest.create({
      data: { playerId, questId, status: 'ACTIVE', progress: 0 },
    });

    res.json({ message: 'Missão aceita!' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao aceitar missão', 500);
  }
});

// GET /api/quests/active
router.get('/active/list', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const activeQuests = await prisma.playerQuest.findMany({
      where: { playerId: req.playerId!, status: 'ACTIVE' },
      include: { quest: { include: { objectives: true } } },
    });
    res.json(activeQuests);
  } catch (error) {
    throw new AppError('Erro ao listar missões ativas', 500);
  }
});

// POST /api/quests/:playerQuestId/progress
router.post('/:playerQuestId/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { playerQuestId } = req.params;
    const { amount = 1 } = req.body;

    const playerQuest = await prisma.playerQuest.findUnique({
      where: { id: playerQuestId },
      include: { quest: { include: { objectives: true } } },
    });

    if (!playerQuest || playerQuest.playerId !== req.playerId!) {
      throw new AppError('Missão não encontrada', 404);
    }

    const newProgress = playerQuest.progress + amount;
    const maxProgress = playerQuest.quest.maxProgress || playerQuest.quest.objectives.reduce((sum, obj) => sum + obj.targetQuantity, 0);

    if (newProgress >= maxProgress) {
      await prisma.playerQuest.update({
        where: { id: playerQuestId },
        data: { status: 'COMPLETED', progress: maxProgress, completedAt: new Date() },
      });
      res.json({ message: 'Missão concluída!', completed: true });
    } else {
      await prisma.playerQuest.update({
        where: { id: playerQuestId },
        data: { progress: newProgress },
      });
      res.json({ message: 'Progresso atualizado', progress: newProgress, maxProgress });
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao atualizar progresso', 500);
  }
});

// POST /api/quests/:playerQuestId/claim
router.post('/:playerQuestId/claim', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const playerQuest = await prisma.playerQuest.findUnique({
      where: { id: req.params.playerQuestId },
      include: { quest: true },
    });

    if (!playerQuest || playerQuest.playerId !== req.playerId!) {
      throw new AppError('Missão não encontrada', 404);
    }

    if (playerQuest.status !== 'COMPLETED') {
      throw new AppError('Missão não foi concluída', 400);
    }

    // Grant rewards
    await prisma.player.update({
      where: { id: req.playerId! },
      data: {
        gold: { increment: playerQuest.quest.goldReward },
        xp: { increment: playerQuest.quest.xpReward },
      },
    });

    await prisma.playerQuest.update({
      where: { id: playerQuest.id },
      data: { status: 'CLAIMED' },
    });

    res.json({
      message: 'Recompensas recebidas!',
      rewards: { gold: playerQuest.quest.goldReward, xp: playerQuest.quest.xpReward },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao reivindicar recompensas', 500);
  }
});

export default router;
