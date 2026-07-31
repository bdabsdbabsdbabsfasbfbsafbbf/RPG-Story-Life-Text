import { Router } from 'express';

export const guildRouter = Router();

guildRouter.get('/', (req, res) => {
  res.json({ guilds: [] });
});

guildRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Heroes Guild' });
});

guildRouter.post('/', (req, res) => {
  res.json({ message: 'Guild created', id: 'new-guild' });
});

guildRouter.post('/:id/invite', (req, res) => {
  res.json({ message: 'Invite sent' });
});

guildRouter.post('/:id/kick', (req, res) => {
  res.json({ message: 'Member kicked' });
});

guildRouter.post('/:id/promote', (req, res) => {
  res.json({ message: 'Member promoted' });
});

guildRouter.post('/:id/donate', (req, res) => {
  res.json({ message: 'Donation received' });
});

guildRouter.get('/:id/members', (req, res) => {
  res.json({ members: [] });
});

guildRouter.get('/:id/quests', (req, res) => {
  res.json({ quests: [] });
});
