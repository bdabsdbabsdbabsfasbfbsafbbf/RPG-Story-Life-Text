import { Router } from 'express';

export const npcRouter = Router();

npcRouter.get('/', (req, res) => {
  res.json({ npcs: [] });
});

npcRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Merchant' });
});

npcRouter.post('/:id/interact', (req, res) => {
  res.json({ message: 'Interaction', options: [] });
});

npcRouter.get('/:id/shop', (req, res) => {
  res.json({ shop: { items: [] } });
});

npcRouter.post('/:id/buy', (req, res) => {
  res.json({ message: 'Item purchased' });
});

npcRouter.post('/:id/sell', (req, res) => {
  res.json({ message: 'Item sold' });
});
