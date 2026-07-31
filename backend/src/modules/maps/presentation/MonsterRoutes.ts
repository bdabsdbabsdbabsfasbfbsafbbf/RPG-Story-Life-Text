import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/monsters
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { mapId, isBoss } = req.query;
    const where: any = {};
    if (isBoss !== undefined) where.isBoss = isBoss === 'true';

    const monsters = mapId
      ? await prisma.mapMonster.findMany({
          where: { mapId: mapId as string },
          include: { monster: true },
        })
      : await prisma.monster.findMany({ where });

    res.json(monsters);
  } catch (error) {
    throw new AppError('Erro ao listar monstros', 500);
  }
});

// GET /api/monsters/:slug
router.get('/:slug', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const monster = await prisma.monster.findUnique({
      where: { slug: req.params.slug },
      include: { drops: { include: { item: true } }, skills: { include: { skill: true } } },
    });
    if (!monster) throw new AppError('Monstro não encontrado', 404);
    res.json(monster);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao buscar monstro', 500);
  }
});

export default router;
