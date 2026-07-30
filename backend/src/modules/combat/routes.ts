import { Router } from 'express';

export const combatRouter = Router();

combatRouter.post('/start', (req, res) => {
  res.json({ message: 'Combat started', combatId: 'new-combat' });
});

combatRouter.post('/action', (req, res) => {
  res.json({ message: 'Action performed', result: {} });
});

combatRouter.post('/end', (req, res) => {
  res.json({ message: 'Combat ended' });
});

combatRouter.get('/state/:characterId', (req, res) => {
  res.json({ state: null });
});
