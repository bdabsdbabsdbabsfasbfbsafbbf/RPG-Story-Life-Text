import { Router } from 'express';

export const chatRouter = Router();

chatRouter.get('/messages', (req, res) => {
  res.json({ messages: [] });
});

chatRouter.get('/history/:channel', (req, res) => {
  res.json({ messages: [] });
});
