import { Router } from 'express';

export const mapRouter = Router();

mapRouter.get('/', (req, res) => {
  res.json({ maps: [] });
});

mapRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Battleon' });
});

mapRouter.get('/:id/npcs', (req, res) => {
  res.json({ npcs: [] });
});

mapRouter.get('/:id/monsters', (req, res) => {
  res.json({ monsters: [] });
});

mapRouter.post('/:id/teleport', (req, res) => {
  res.json({ message: 'Teleported' });
});
