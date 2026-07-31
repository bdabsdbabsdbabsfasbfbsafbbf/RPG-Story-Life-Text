import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, adminMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';
import { logger } from '../../../shared/infrastructure/logger/Logger';

const router = Router();

// All admin routes require auth + admin
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [playerCount, guildCount, activeCombats, totalItems] = await Promise.all([
      prisma.player.count(),
      prisma.guild.count(),
      prisma.battleLog.count({ where: { createdAt: { gte: new Date(Date.now() - 3600000) } } }),
      prisma.item.count(),
    ]);

    res.json({ playerCount, guildCount, activeCombats, totalItems });
  } catch (error) {
    throw new AppError('Erro ao carregar dashboard', 500);
  }
});

// CRUD: Items
router.get('/items', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.item.findMany({ orderBy: { name: 'asc' } });
    res.json(items);
  } catch (error) {
    throw new AppError('Erro ao listar itens', 500);
  }
});

router.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.item.create({ data: req.body });
    logger.info(`Admin ${req.username} created item: ${item.name}`);
    res.json(item);
  } catch (error) {
    throw new AppError('Erro ao criar item', 500);
  }
});

router.put('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.item.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  } catch (error) {
    throw new AppError('Erro ao atualizar item', 500);
  }
});

router.delete('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.item.delete({ where: { id: req.params.id } });
    res.json({ message: 'Item deletado' });
  } catch (error) {
    throw new AppError('Erro ao deletar item', 500);
  }
});

// CRUD: Classes
router.get('/classes', async (req: AuthRequest, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: { ranks: { orderBy: { rankNumber: 'asc' } }, skills: true },
    });
    res.json(classes);
  } catch (error) {
    throw new AppError('Erro ao listar classes', 500);
  }
});

router.post('/classes', async (req: AuthRequest, res: Response) => {
  try {
    const { ranks, skills, ...classData } = req.body;
    const class_ = await prisma.class.create({
      data: {
        ...classData,
        ranks: { create: ranks || [] },
        skills: skills ? { create: skills } : undefined,
      },
    });
    res.json(class_);
  } catch (error) {
    throw new AppError('Erro ao criar classe', 500);
  }
});

router.put('/classes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { ranks, skills, ...classData } = req.body;
    const class_ = await prisma.class.update({ where: { id: req.params.id }, data: classData });
    if (ranks) {
      await prisma.classRank.deleteMany({ where: { classId: class_.id } });
      await prisma.classRank.createMany({ data: ranks.map((r: any) => ({ ...r, classId: class_.id })) });
    }
    res.json(class_);
  } catch (error) {
    throw new AppError('Erro ao atualizar classe', 500);
  }
});

router.delete('/classes/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.json({ message: 'Classe deletada' });
  } catch (error) {
    throw new AppError('Erro ao deletar classe', 500);
  }
});

// CRUD: Skills
router.get('/skills', async (req: AuthRequest, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      include: { effects: true },
      orderBy: { name: 'asc' },
    });
    res.json(skills);
  } catch (error) {
    throw new AppError('Erro ao listar skills', 500);
  }
});

router.post('/skills', async (req: AuthRequest, res: Response) => {
  try {
    const { effects, ...skillData } = req.body;
    const skill = await prisma.skill.create({
      data: {
        ...skillData,
        effects: { create: effects || [] },
      },
    });
    res.json(skill);
  } catch (error) {
    throw new AppError('Erro ao criar skill', 500);
  }
});

router.put('/skills/:id', async (req: AuthRequest, res: Response) => {
  try {
    const skill = await prisma.skill.update({ where: { id: req.params.id }, data: req.body });
    res.json(skill);
  } catch (error) {
    throw new AppError('Erro ao atualizar skill', 500);
  }
});

router.delete('/skills/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ message: 'Skill deletada' });
  } catch (error) {
    throw new AppError('Erro ao deletar skill', 500);
  }
});

// CRUD: Monsters
router.get('/monsters', async (req: AuthRequest, res: Response) => {
  try {
    const monsters = await prisma.monster.findMany({ orderBy: { name: 'asc' } });
    res.json(monsters);
  } catch (error) {
    throw new AppError('Erro ao listar monstros', 500);
  }
});

router.post('/monsters', async (req: AuthRequest, res: Response) => {
  try {
    const monster = await prisma.monster.create({ data: req.body });
    res.json(monster);
  } catch (error) {
    throw new AppError('Erro ao criar monstro', 500);
  }
});

router.put('/monsters/:id', async (req: AuthRequest, res: Response) => {
  try {
    const monster = await prisma.monster.update({ where: { id: req.params.id }, data: req.body });
    res.json(monster);
  } catch (error) {
    throw new AppError('Erro ao atualizar monstro', 500);
  }
});

router.delete('/monsters/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.monster.delete({ where: { id: req.params.id } });
    res.json({ message: 'Monstro deletado' });
  } catch (error) {
    throw new AppError('Erro ao deletar monstro', 500);
  }
});

// CRUD: Maps
router.get('/maps', async (req: AuthRequest, res: Response) => {
  try {
    const maps = await prisma.map.findMany({ orderBy: { name: 'asc' } });
    res.json(maps);
  } catch (error) {
    throw new AppError('Erro ao listar mapas', 500);
  }
});

router.post('/maps', async (req: AuthRequest, res: Response) => {
  try {
    const map = await prisma.map.create({ data: req.body });
    res.json(map);
  } catch (error) {
    throw new AppError('Erro ao criar mapa', 500);
  }
});

router.put('/maps/:id', async (req: AuthRequest, res: Response) => {
  try {
    const map = await prisma.map.update({ where: { id: req.params.id }, data: req.body });
    res.json(map);
  } catch (error) {
    throw new AppError('Erro ao atualizar mapa', 500);
  }
});

router.delete('/maps/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.map.delete({ where: { id: req.params.id } });
    res.json({ message: 'Mapa deletado' });
  } catch (error) {
    throw new AppError('Erro ao deletar mapa', 500);
  }
});

// CRUD: Quests
router.get('/quests', async (req: AuthRequest, res: Response) => {
  try {
    const quests = await prisma.quest.findMany({
      include: { objectives: true },
      orderBy: { name: 'asc' },
    });
    res.json(quests);
  } catch (error) {
    throw new AppError('Erro ao listar missões', 500);
  }
});

router.post('/quests', async (req: AuthRequest, res: Response) => {
  try {
    const { objectives, ...questData } = req.body;
    const quest = await prisma.quest.create({
      data: { ...questData, objectives: { create: objectives || [] } },
    });
    res.json(quest);
  } catch (error) {
    throw new AppError('Erro ao criar missão', 500);
  }
});

router.put('/quests/:id', async (req: AuthRequest, res: Response) => {
  try {
    const quest = await prisma.quest.update({ where: { id: req.params.id }, data: req.body });
    res.json(quest);
  } catch (error) {
    throw new AppError('Erro ao atualizar missão', 500);
  }
});

router.delete('/quests/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.quest.delete({ where: { id: req.params.id } });
    res.json({ message: 'Missão deletada' });
  } catch (error) {
    throw new AppError('Erro ao deletar missão', 500);
  }
});

// Broadcast message to all players
router.post('/broadcast', async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const { SocketServer } = require('../../../shared/infrastructure/websocket/SocketServer');
    SocketServer.emitGlobal('admin-broadcast', {
      message,
      adminName: req.username,
      timestamp: new Date(),
    });
    res.json({ message: 'Mensagem enviada para todos os jogadores' });
  } catch (error) {
    throw new AppError('Erro ao enviar broadcast', 500);
  }
});

// Game Events
router.get('/events', async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.gameEvent.findMany({ orderBy: { startAt: 'desc' } });
    res.json(events);
  } catch (error) {
    throw new AppError('Erro ao listar eventos', 500);
  }
});

router.post('/events', async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.gameEvent.create({ data: req.body });
    res.json(event);
  } catch (error) {
    throw new AppError('Erro ao criar evento', 500);
  }
});

router.put('/events/:id', async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.gameEvent.update({ where: { id: req.params.id }, data: req.body });
    res.json(event);
  } catch (error) {
    throw new AppError('Erro ao atualizar evento', 500);
  }
});

// Logs
router.get('/logs', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (error) {
    throw new AppError('Erro ao carregar logs', 500);
  }
});

// Players list
router.get('/players', async (req: AuthRequest, res: Response) => {
  try {
    const players = await prisma.player.findMany({
      select: { id: true, username: true, level: true, gold: true, diamonds: true, createdAt: true },
      orderBy: { level: 'desc' },
      take: 100,
    });
    res.json(players);
  } catch (error) {
    throw new AppError('Erro ao listar jogadores', 500);
  }
});

export default router;
