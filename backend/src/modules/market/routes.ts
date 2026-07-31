import { Router } from 'express';

export const marketRouter = Router();

marketRouter.get('/', (req, res) => {
  res.json({ listings: [], total: 0, page: 1 });
});

marketRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, item: {} });
});

marketRouter.post('/list', (req, res) => {
  res.json({ message: 'Item listed', listingId: 'new-listing' });
});

marketRouter.post('/:id/buy', (req, res) => {
  res.json({ message: 'Item purchased' });
});

marketRouter.post('/:id/cancel', (req, res) => {
  res.json({ message: 'Listing cancelled' });
});

marketRouter.post('/:id/bid', (req, res) => {
  res.json({ message: 'Bid placed' });
});
