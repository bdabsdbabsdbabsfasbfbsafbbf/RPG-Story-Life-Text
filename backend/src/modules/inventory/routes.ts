import { Router } from 'express';

export const inventoryRouter = Router();

inventoryRouter.get('/', (req, res) => {
  res.json({ items: [], total: 0, page: 1 });
});

inventoryRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Item' });
});

inventoryRouter.post('/:id/favorite', (req, res) => {
  res.json({ message: 'Favorite toggled' });
});

inventoryRouter.delete('/:id', (req, res) => {
  res.json({ message: 'Item deleted' });
});
