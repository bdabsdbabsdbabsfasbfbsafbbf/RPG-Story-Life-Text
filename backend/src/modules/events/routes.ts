import { Router } from 'express';

export const eventRouter = Router();

eventRouter.get('/', (req, res) => {
  res.json({ events: [] });
});

eventRouter.get('/active', (req, res) => {
  res.json({ activeEvents: [] });
});

eventRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Festival' });
});
