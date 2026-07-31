import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/register', rateLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/login', rateLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/discord', (req, res, next) => authController.discordCallback(req, res, next));
router.get('/discord/login', (req, res, next) => authController.discordRedirect(req, res, next));
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));
router.put('/profile', authenticate, (req, res, next) => authController.updateProfile(req, res, next));

export default router;
