import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';
import { ChatController } from './chat.gateway';

const router = Router();
const chatController = new ChatController();

router.get('/history/:channel', authenticate, rateLimiter, (req, res, next) => chatController.getHistory(req, res, next));
router.delete('/messages/:id', authenticate, (req, res, next) => chatController.deleteMessage(req, res, next));
router.get('/online', authenticate, (req, res, next) => chatController.getOnlineUsers(req, res, next));

export default router;
