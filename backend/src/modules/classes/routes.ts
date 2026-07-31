import { Router } from 'express';

export const classRouter = Router();

classRouter.get('/', (req, res) => {
  res.json({ classes: [] });
});

classRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Warrior' });
});

classRouter.get('/:id/skills', (req, res) => {
  res.json({ skills: [] });
});

classRouter.post('/:id/equip', (req, res) => {
  res.json({ message: 'Class equipped' });
});
