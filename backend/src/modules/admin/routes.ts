import { Router } from 'express';

export const adminRouter = Router();

adminRouter.get('/dashboard', (req, res) => {
  res.json({
    onlinePlayers: 0,
    totalPlayers: 0,
    activeCombats: 0,
    serverUptime: process.uptime(),
  });
});

adminRouter.get('/classes', (req, res) => {
  res.json({ classes: [] });
});

adminRouter.post('/classes', (req, res) => {
  res.json({ message: 'Class created', id: 'new-class' });
});

adminRouter.put('/classes/:id', (req, res) => {
  res.json({ message: 'Class updated' });
});

adminRouter.delete('/classes/:id', (req, res) => {
  res.json({ message: 'Class deleted' });
});

adminRouter.get('/items', (req, res) => {
  res.json({ items: [] });
});

adminRouter.post('/items', (req, res) => {
  res.json({ message: 'Item created' });
});

adminRouter.put('/items/:id', (req, res) => {
  res.json({ message: 'Item updated' });
});

adminRouter.delete('/items/:id', (req, res) => {
  res.json({ message: 'Item deleted' });
});

adminRouter.get('/monsters', (req, res) => {
  res.json({ monsters: [] });
});

adminRouter.post('/monsters', (req, res) => {
  res.json({ message: 'Monster created' });
});

adminRouter.put('/monsters/:id', (req, res) => {
  res.json({ message: 'Monster updated' });
});

adminRouter.delete('/monsters/:id', (req, res) => {
  res.json({ message: 'Monster deleted' });
});

adminRouter.get('/maps', (req, res) => {
  res.json({ maps: [] });
});

adminRouter.post('/maps', (req, res) => {
  res.json({ message: 'Map created' });
});

adminRouter.put('/maps/:id', (req, res) => {
  res.json({ message: 'Map updated' });
});

adminRouter.delete('/maps/:id', (req, res) => {
  res.json({ message: 'Map deleted' });
});

adminRouter.get('/quests', (req, res) => {
  res.json({ quests: [] });
});

adminRouter.post('/quests', (req, res) => {
  res.json({ message: 'Quest created' });
});

adminRouter.put('/quests/:id', (req, res) => {
  res.json({ message: 'Quest updated' });
});

adminRouter.delete('/quests/:id', (req, res) => {
  res.json({ message: 'Quest deleted' });
});

adminRouter.get('/npcs', (req, res) => {
  res.json({ npcs: [] });
});

adminRouter.post('/npcs', (req, res) => {
  res.json({ message: 'NPC created' });
});

adminRouter.put('/npcs/:id', (req, res) => {
  res.json({ message: 'NPC updated' });
});

adminRouter.delete('/npcs/:id', (req, res) => {
  res.json({ message: 'NPC deleted' });
});

adminRouter.get('/buffs', (req, res) => {
  res.json({ buffs: [] });
});

adminRouter.post('/buffs', (req, res) => {
  res.json({ message: 'Buff created' });
});

adminRouter.put('/buffs/:id', (req, res) => {
  res.json({ message: 'Buff updated' });
});

adminRouter.delete('/buffs/:id', (req, res) => {
  res.json({ message: 'Buff deleted' });
});

adminRouter.get('/players', (req, res) => {
  res.json({ players: [] });
});

adminRouter.post('/announce', (req, res) => {
  res.json({ message: 'Announcement sent' });
});

adminRouter.post('/give-item', (req, res) => {
  res.json({ message: 'Item given' });
});
