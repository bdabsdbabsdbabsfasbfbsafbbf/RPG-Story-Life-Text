import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { CombatManager } from '../domain/CombatManager';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// POST /api/combat/start/:monsterId
router.post('/start/:monsterId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { monsterId } = req.params;
    const playerId = req.playerId!;

    const monster = await prisma.monster.findUnique({ where: { id: monsterId } });
    if (!monster) throw new AppError('Monstro não encontrado', 404);

    const combat = CombatManager.startCombat(playerId, monsterId);

    res.json({
      message: 'Combate iniciado',
      monster: { name: monster.name, level: monster.level, hp: monster.hp },
      combat: true,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao iniciar combate', 500);
  }
});

// POST /api/combat/skill
router.post('/skill', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { targetId, skillId } = req.body;
    const playerId = req.playerId!;

    await CombatManager.useSkill(playerId, targetId, skillId);

    res.json({ message: 'Skill used', skillId });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao usar skill', 500);
  }
});

// GET /api/combat/status
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const combatInfo = CombatManager.getPlayerCombatInfo(req.playerId!);
    res.json(combatInfo);
  } catch (error) {
    throw new AppError('Erro ao obter status de combate', 500);
  }
});

export default router;
