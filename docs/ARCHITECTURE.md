# Architecture

## Backend (Clean Architecture)

```
┌────────────────────────────────────────────────────┐
│                 Express HTTP Server                  │
├────────────────────────────────────────────────────┤
│                    Modules                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Auth    │ │ Combat   │ │ Classes  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
├────────────────────────────────────────────────────┤
│                 Core Layer                          │
│  Config, Middleware, Utils, Error Handling         │
├────────────────────────────────────────────────────┤
│              Infrastructure Layer                    │
│     Prisma (PostgreSQL) + Redis (ioredis)          │
└────────────────────────────────────────────────────┘
```

## Frontend Component Tree

```
App
├── LoginPage / RegisterPage
└── GameLayout
    ├── TopBar (gold, diamonds, level, user info)
    ├── Sidebar (navigation)
    ├── Main Content (pages)
    │   ├── DashboardPage
    │   ├── MapPage
    │   ├── ClassPage
    │   ├── InventoryPage
    │   ├── GuildPage
    │   ├── MarketPage
    │   ├── QuestPage
    │   └── CombatPage
    ├── ChatPanel (global, local, guild, party, trade)
    └── CombatHUD (overlay during combat)
```

## Data Flow

1. User authenticates via Discord OAuth or credentials
2. JWT token stored in httpOnly cookie
3. Socket.IO connection established with token
4. User selects character and enters a map
5. Monsters are visible on the map
6. Combating a monster triggers real-time combat via WebSocket
7. Skills have individual cooldowns managed via Redis
8. Combat results sync to PostgreSQL for persistence

## Database (ERD)

Key entities:
- User -> Character -> GameClass
- Character -> CombatStats, Equipment, ActiveBuffs, Stacks
- GameClass -> Skill, ClassPassive, ClassUpgrade, MasteryBonus
- Map -> MapMonster -> Monster
- Map -> MapNpc -> Npc -> ShopItem, Quest
- User -> Inventory -> Item
- User -> GuildMember -> Guild
- User -> MarketListing -> Item
- User -> QuestProgress -> Quest

## Combat Flow

1. Player sends `combat:start` via WebSocket
2. CombatService creates CombatInstance
3. Monster auto-attacks on interval (every 2s)
4. Player sends `combat:useSkill` with skill ID
5. CooldownManager checks Redis for cooldown
6. If available, applies skill damage/effects/buffs/stacks
7. Updates HP/Mana/Stamina
8. Sends combat update via WebSocket
9. If monster HP <= 0: victory, rewards granted
10. If player HP <= 0: defeat
