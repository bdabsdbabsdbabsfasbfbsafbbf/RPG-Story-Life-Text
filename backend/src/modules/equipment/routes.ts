import { Router } from 'express';

export const equipmentRouter = Router();

equipmentRouter.get('/', (req, res) => {
  res.json({ equipment: [] });
});

equipmentRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Steel Sword' });
});

equipmentRouter.post('/', (req, res) => {
  res.json({ message: 'Equipment created' });
});

equipmentRouter.patch('/:id', (req, res) => {
  res.json({ message: 'Equipment updated' });
});

equipmentRouter.delete('/:id', (req, res) => {
  res.json({ message: 'Equipment deleted' });
});

equipmentRouter.post('/:id/enchant', (req, res) => {
  res.json({ message: 'Equipment enchanted' });
});

equipmentRouter.post('/:id/socket', (req, res) => {
  res.json({ message: 'Gem socketed' });
});
