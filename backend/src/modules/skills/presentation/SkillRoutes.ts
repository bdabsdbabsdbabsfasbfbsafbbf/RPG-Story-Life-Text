import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/skills
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { classId, type } = req.query;
    const where: any = {};
    if (classId) where.classId = classId;
    if (type) where.type = type;

    const skills = await prisma.skill.findMany({
      where,
      include: { effects: true },
      orderBy: { name: 'asc' },
    });
    res.json(skills);
  } catch (error) {
    throw new AppError('Erro ao listar skills', 500);
  }
});

// GET /api/skills/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: req.params.id },
      include: { effects: true },
    });
    if (!skill) throw new AppError('Skill não encontrada', 404);
    res.json(skill);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao buscar skill', 500);
  }
});

export default router;
