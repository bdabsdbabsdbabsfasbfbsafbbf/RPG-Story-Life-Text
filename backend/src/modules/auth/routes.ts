import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/discord', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }
  res.json({ message: 'Discord auth endpoint', code });
});

authRouter.get('/me', (req, res) => {
  res.json({ message: 'User info endpoint' });
});

authRouter.post('/refresh', (req, res) => {
  res.json({ message: 'Token refresh endpoint' });
});

authRouter.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint' });
});
