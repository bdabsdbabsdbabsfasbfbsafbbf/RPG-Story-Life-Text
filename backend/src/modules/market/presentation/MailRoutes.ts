import { Router, Response } from 'express';
import { prisma } from '../../../shared/infrastructure/database/PrismaClient';
import { authMiddleware, AuthRequest } from '../../../api/middleware/AuthMiddleware';
import { AppError } from '../../../api/middleware/ErrorHandler';

const router = Router();

// GET /api/mail
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const mail = await prisma.mail.findMany({
      where: { receiverId: req.playerId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json(mail);
  } catch (error) {
    throw new AppError('Erro ao listar correio', 500);
  }
});

// POST /api/mail/send
router.post('/send', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, subject, body, gold, itemId, quantity } = req.body;

    const receiver = await prisma.player.findUnique({ where: { id: receiverId } });
    if (!receiver) throw new AppError('Jogador não encontrado', 404);

    const mail = await prisma.mail.create({
      data: {
        senderId: req.playerId!,
        receiverId,
        subject,
        body,
        gold: gold || 0,
        itemId: itemId || null,
        itemQuantity: quantity || 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json(mail);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao enviar mensagem', 500);
  }
});

// POST /api/mail/:mailId/read
router.post('/:mailId/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const mail = await prisma.mail.updateMany({
      where: { id: req.params.mailId, receiverId: req.playerId! },
      data: { isRead: true },
    });
    res.json({ message: 'Mensagem marcada como lida' });
  } catch (error) {
    throw new AppError('Erro ao marcar mensagem', 500);
  }
});

// POST /api/mail/:mailId/claim
router.post('/:mailId/claim', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const mail = await prisma.mail.findUnique({ where: { id: req.params.mailId } });
    if (!mail || mail.receiverId !== req.playerId!) throw new AppError('Mensagem não encontrada', 404);
    if (mail.isClaimed) throw new AppError('Recompensa já retirada', 400);

    // Claim gold and items
    await prisma.player.update({
      where: { id: req.playerId! },
      data: { gold: { increment: mail.gold } },
    });

    if (mail.itemId) {
      const existing = await prisma.playerInventory.findFirst({
        where: { playerId: req.playerId!, itemId: mail.itemId, equipped: false },
      });
      if (existing) {
        await prisma.playerInventory.update({
          where: { id: existing.id },
          data: { quantity: { increment: mail.itemQuantity } },
        });
      } else {
        await prisma.playerInventory.create({
          data: { playerId: req.playerId!, itemId: mail.itemId, quantity: mail.itemQuantity },
        });
      }
    }

    await prisma.mail.update({
      where: { id: mail.id },
      data: { isClaimed: true },
    });

    res.json({ message: 'Recompensas retiradas!' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao retirar recompensas', 500);
  }
});

export default router;
