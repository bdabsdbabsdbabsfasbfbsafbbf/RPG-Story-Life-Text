import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// POST /api/guilds/create
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const playerId = req.playerId!;

    const existing = await prisma.guild.findUnique({ where: { name } });
    if (existing) throw new AppError('Nome de guild já existe', 400);

    const guild = await prisma.guild.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        leaderId: playerId,
        members: {
          create: { playerId, role: 'LEADER' },
        },
      },
    });

    res.json(guild);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao criar guild', 500);
  }
});

// POST /api/guilds/:guildId/join
router.post('/:guildId/join', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const guild = await prisma.guild.findUnique({ where: { id: req.params.guildId } });
    if (!guild) throw new AppError('Guild não encontrada', 404);

    if (guild.memberCount >= guild.maxMembers) {
      throw new AppError('Guild está cheia', 400);
    }

    const existing = await prisma.guildMember.findFirst({
      where: { playerId: req.playerId! },
    });
    if (existing) throw new AppError('Você já está em uma guild', 400);

    await prisma.guildMember.create({
      data: { guildId: guild.id, playerId: req.playerId!, role: 'MEMBER' },
    });

    await prisma.guild.update({
      where: { id: guild.id },
      data: { memberCount: { increment: 1 } },
    });

    res.json({ message: 'Entrou na guild!' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao entrar na guild', 500);
  }
});

// GET /api/guilds/my
router.get('/my/info', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const membership = await prisma.guildMember.findFirst({
      where: { playerId: req.playerId! },
      include: {
        guild: {
          include: {
            members: { include: { player: { select: { id: true, username: true, level: true } } } },
            perks: true,
          },
        },
      },
    });
    if (!membership) throw new AppError('Você não está em uma guild', 404);
    res.json(membership);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao buscar guild', 500);
  }
});

export default router;
