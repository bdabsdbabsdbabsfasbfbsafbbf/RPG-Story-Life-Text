import { Router } from 'express';

export const characterRouter = Router();

characterRouter.get('/', (req, res) => {
  res.json({ characters: [] });
});

characterRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Hero', level: 1 });
});

characterRouter.post('/', (req, res) => {
  res.json({ message: 'Character created', id: 'new-id' });
});

characterRouter.patch('/:id', (req, res) => {
  res.json({ message: 'Character updated' });
});

characterRouter.get('/:id/stats', (req, res) => {
  res.json({ stats: {} });
});

characterRouter.post('/:id/equip', (req, res) => {
  res.json({ message: 'Item equipped' });
});

characterRouter.post('/:id/unequip', (req, res) => {
  res.json({ message: 'Item unequipped' });
});
