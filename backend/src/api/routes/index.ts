import { Router } from 'express';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Auth routes
import authRoutes from '../../modules/auth/presentation/AuthRoutes';
router.use('/auth', authRoutes);

// Player routes
import playerRoutes from '../../modules/classes/presentation/PlayerRoutes';
router.use('/players', playerRoutes);

// Class routes
import classRoutes from '../../modules/classes/presentation/ClassRoutes';
router.use('/classes', classRoutes);

// Skill routes
import skillRoutes from '../../modules/skills/presentation/SkillRoutes';
router.use('/skills', skillRoutes);

// Item routes
import itemRoutes from '../../modules/inventory/presentation/ItemRoutes';
router.use('/items', itemRoutes);

// Inventory routes
import inventoryRoutes from '../../modules/inventory/presentation/InventoryRoutes';
router.use('/inventory', inventoryRoutes);

// Map routes
import mapRoutes from '../../modules/maps/presentation/MapRoutes';
router.use('/maps', mapRoutes);

// Monster routes
import monsterRoutes from '../../modules/maps/presentation/MonsterRoutes';
router.use('/monsters', monsterRoutes);

// NPC routes
import npcRoutes from '../../modules/npc/presentation/NPCRoutes';
router.use('/npcs', npcRoutes);

// Quest routes
import questRoutes from '../../modules/quest/presentation/QuestRoutes';
router.use('/quests', questRoutes);

// Guild routes
import guildRoutes from '../../modules/guild/presentation/GuildRoutes';
router.use('/guilds', guildRoutes);

// Market routes
import marketRoutes from '../../modules/market/presentation/MarketRoutes';
router.use('/market', marketRoutes);

// Mail routes
import mailRoutes from '../../modules/market/presentation/MailRoutes';
router.use('/mail', mailRoutes);

// Combat routes
import combatRoutes from '../../modules/combat/presentation/CombatRoutes';
router.use('/combat', combatRoutes);

// Admin routes
import adminRoutes from '../../modules/events/presentation/AdminRoutes';
router.use('/admin', adminRoutes);

export default router;
