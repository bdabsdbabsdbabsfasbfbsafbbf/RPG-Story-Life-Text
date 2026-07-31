import { Router } from 'express';

export const questRouter = Router();

questRouter.get('/', (req, res) => {
  res.json({ quests: [] });
});

questRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'First Adventure' });
});

questRouter.post('/:id/accept', (req, res) => {
  res.json({ message: 'Quest accepted' });
});

questRouter.post('/:id/progress', (req, res) => {
  res.json({ message: 'Progress updated' });
});

questRouter.post('/:id/claim', (req, res) => {
  res.json({ message: 'Rewards claimed' });
});

questRouter.post('/:id/abandon', (req, res) => {
  res.json({ message: 'Quest abandoned' });
});
