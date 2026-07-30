# API Documentation

## Authentication
All API routes (except auth) require JWT token via cookie or Authorization header.

## Endpoints

### Health
- `GET /api/health` - Server health check

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/discord` - Discord OAuth
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

### Characters
- `GET /api/characters/:id/class` - Character class details
- `POST /api/characters/:id/class` - Equip class

### Classes
- `GET /api/classes` - All classes
- `GET /api/classes/:slug` - Class details

### Items
- `GET /api/items` - List items (paginated)
- `GET /api/items/:id` - Item details

### Inventory
- `GET /api/inventory` - User inventory
- `GET /api/inventory/equipped` - Equipped items
- `POST /api/inventory/equip` - Equip item
- `POST /api/inventory/unequip` - Unequip

### Maps
- `GET /api/maps` - All maps
- `GET /api/maps/:slug` - Map details

### Quests
- `GET /api/quests` - All quests
- `GET /api/quests/:id` - Quest details
- `POST /api/quests/:id/accept` - Accept quest
- `GET /api/quests/progress` - User quest progress
- `POST /api/quests/:id/claim` - Claim rewards

### Guilds
- `GET /api/guilds` - All guilds
- `GET /api/guilds/rankings` - Top guilds
- `GET /api/guilds/:id` - Guild details
- `POST /api/guilds` - Create guild
- `POST /api/guilds/:id/join` - Join guild
- `DELETE /api/guilds/:id/leave` - Leave guild
- `GET /api/user/guild` - User's guild

### Market
- `GET /api/market` - Active listings
- `GET /api/market/my` - User's listings
- `POST /api/market/sell` - Create listing
- `POST /api/market/buy/:id` - Buy item
- `DELETE /api/market/:id/cancel` - Cancel listing

### NPCs
- `GET /api/npcs` - All NPCs
- `GET /api/npcs/:id` - NPC details
- `GET /api/npcs/:id/shop` - NPC shop

### Events
- `GET /api/events` - All events
- `GET /api/events/active` - Active events
- `GET /api/events/:id` - Event details
- `GET /api/seasons` - All seasons
- `GET /api/seasons/active` - Active season
