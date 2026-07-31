import { Router } from 'express';

export const skillRouter = Router();

skillRouter.get('/', (req, res) => {
  res.json({ skills: [] });
});

skillRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Fire Slash' });
});
