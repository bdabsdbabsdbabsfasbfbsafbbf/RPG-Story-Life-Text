# RPG Story Life

Um MMORPG de texto completo, moderno e escalável, inspirado em AQWorlds, DragonFable e Adventure Quest, com combate em tempo real baseado em cooldowns.

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│              React + Vite + TailwindCSS                 │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/WS
┌────────────────────▼────────────────────────────────────┐
│                     Gateway                              │
│              Socket.IO + Express                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                     Backend                              │
│           Node.js + TypeScript + Clean Architecture      │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Auth    │ │ Combat   │ │ Classes  │ │  Items   │   │
│  │  Module  │ │ Module   │ │ Module   │ │  Module  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Guild   │ │ Market   │ │  Maps    │ │  Quests  │   │
│  │  Module  │ │ Module   │ │ Module   │ │  Module  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │   NPC    │ │ Events   │ │  Admin   │                │
│  │  Module  │ │ Module   │ │ Module   │                │
│  └──────────┘ └──────────┘ └──────────┘                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Database Layer                         │
│              PostgreSQL + Prisma + Redis                 │
└─────────────────────────────────────────────────────────┘
```

## Stack Tecnológica

- **Backend**: Node.js + TypeScript + Express + Socket.IO
- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Admin**: React + Vite + TailwindCSS
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis (ioredis)
- **Auth**: Discord OAuth2 + JWT + bcrypt
- **Infra**: Docker + Railway

## Estrutura do Projeto

```
RPG Story Life/
├── backend/
│   ├── prisma/              # Schema e migrações
│   ├── database/
│   │   ├── migrations/      # Migrações SQL
│   │   └── seeds/           # Seeds do banco
│   └── src/
│       ├── core/            # Config, middlewares, utils
│       ├── gateway/         # WebSocket (Socket.IO)
│       └── modules/
│           ├── auth/        # Autenticação
│           ├── combat/      # Sistema de combate
│           ├── classes/     # Sistema de classes
│           ├── skills/      # Habilidades
│           ├── items/       # Itens
│           ├── inventory/   # Inventário
│           ├── maps/        # Mapas
│           ├── quests/      # Missões
│           ├── guild/       # Guildas
│           ├── market/      # Mercado/Leilão
│           ├── npc/         # NPCs
│           ├── events/      # Eventos/Season Pass
│           └── admin/       # Painel administrativo
├── frontend/
│   └── src/
│       ├── components/      # Componentes React
│       │   ├── layout/      # Layout (Sidebar, TopBar, Chat)
│       │   └── combat/      # HUD de combate
│       ├── pages/           # Páginas
│       ├── services/        # API e Socket
│       ├── store/           # Zustand stores
│       ├── styles/          # CSS/Tailwind
│       └── types/           # TypeScript types
├── admin/
│   └── src/                 # Painel administrativo
├── docs/                    # Documentação
└── docker-compose.yml       # Docker config
```

## Instalação Local

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker (opcional)

### Passos

```bash
# 1. Clone o repositório
git clone <repo-url>
cd "RPG Story Life"

# 2. Instale as dependências
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
cd ..

# 3. Configure o banco de dados
cp .env.example .env
# Edite .env com suas configurações

# 4. Execute as migrações
cd backend
npx prisma migrate dev
npm run seed

# 5. Inicie o desenvolvimento
npm run dev  # Inicia backend + frontend
```

### Docker

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up

# Produção
docker-compose -f docker-compose.prod.yml up
```

## Deploy na Railway

O projeto roda como **um único serviço** no Railway (monolito): o backend Express serve a API (`/api/*`), o WebSocket (Socket.IO) e também o frontend buildado (`/`). O healthcheck usa `GET /api/health`.

1. Conecte o repositório ao Railway (serviço único, root directory = raiz do repositório)
2. Provisione os plugins **PostgreSQL** e **Redis** no projeto
3. Configure as variáveis de ambiente no Railway:
   - `DATABASE_URL` - PostgreSQL connection string (injetada automaticamente pelo plugin)
   - `REDIS_URL` - Redis connection string (injetada automaticamente pelo plugin)
   - `JWT_SECRET` - Chave secreta JWT
   - `FRONTEND_URL` - URL pública do serviço (ex: `https://<app>.up.railway.app`)
   - `ADMIN_URL` - URL do painel admin
   - `NODE_ENV=production`
4. O `railway.json` na raiz define build (`npm run build` = backend + frontend), start e healthcheck `/api/health`
5. A cada push na `main`, o Railway faz deploy automático via integração GitHub

## API REST

### Autenticação
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/discord` - Discord OAuth
- `GET /api/auth/me` - Dados do usuário
- `POST /api/auth/logout` - Logout

### Classes
- `GET /api/classes` - Listar classes
- `GET /api/classes/:slug` - Detalhes da classe
- `GET /api/classes/:slug/skills` - Skills da classe
- `GET /api/classes/:slug/passives` - Passivas da classe

### Mapas
- `GET /api/maps` - Listar mapas
- `GET /api/maps/:slug` - Detalhes do mapa

### Combate
- Via WebSocket: `combat:start`, `combat:useSkill`

### Inventário
- `GET /api/inventory` - Listar inventário
- `POST /api/inventory/equip` - Equipar item
- `POST /api/inventory/unequip` - Desequipar

### Quests
- `GET /api/quests` - Listar missões
- `POST /api/quests/:id/accept` - Aceitar missão
- `POST /api/quests/:id/claim` - Receber recompensa

### Guildas
- `GET /api/guilds` - Listar guildas
- `POST /api/guilds` - Criar guilda
- `POST /api/guilds/:id/join` - Entrar na guilda

### Mercado
- `GET /api/market` - Listar listagens
- `POST /api/market/sell` - Vender item
- `POST /api/market/buy/:id` - Comprar item

## WebSocket Events

### Client → Server
- `character:select` - Selecionar personagem
- `map:join` - Entrar em um mapa
- `map:leave` - Sair do mapa
- `chat:message` - Enviar mensagem
- `combat:start` - Iniciar combate
- `combat:useSkill` - Usar habilidade
- `party:invite` - Convidar para party
- `party:join` - Entrar na party

### Server → Client
- `chat:message` - Nova mensagem
- `combat:started` - Combate iniciado
- `combat:skillUsed` - Habilidade usada
- `combat:update` - Atualização do combate
- `player:joined` - Jogador entrou no mapa
- `player:left` - Jogador saiu do mapa
- `party:invite` - Receber convite de party

## Features Implementadas

### Sistema de Classes
- 5 classes iniciais (ShadowStalker, Crystal Guardian, Arcane Weaver, Storm Berserker, Holy Luminary)
- Skills por rank (1-10)
- Passivas por rank
- Ultimate skill no rank 10
- Sistema de stacks (Bleeding, Dark Energy)
- Combos entre skills
- Mastery bonuses por rank

### Combate em Tempo Real
- Cooldowns individuais por skill
- Auto-attack do monstro
- Sistema de crítico, esquiva e bloqueio
- HUD de combate
- Log de combate
- Recompensas por vitória

### Economia
- Mercado entre jogadores
- NPC shops
- Craft (estrutura pronta)
- Sistema de moedas (Gold e Diamonds)

### Social
- Chat global, local, guild, party, trade
- Guildas completas (banco, perks, ranking)
- Party system
- Amizades

### Progressão
- Níveis de personagem
- Rank de classe (1-10)
- Missões (história, diárias, etc.)
- Títulos e conquistas
- Season Pass

### Painel Administrativo
- CRUD completo para: Classes, Itens, Monstros, Mapas, Missões, Skills, Buffs
- Dashboard com estatísticas
- Gerenciamento de usuários

## Expansões Futuras

O projeto foi arquitetado para permitir adição de conteúdo sem reestruturação:

- **Novas Classes**: Criar pelo painel admin, adicionar skills
- **Eventos Sazonais**: Sistema de eventos com datas
- **Season Pass**: Sistema de tiers com recompensas free/premium
- **Novos Mapas**: Criar pelo painel, conectar com existentes
- **Bosses**: Sistema de raid com grupos
- **PvP**: Arenas e campos de batalha
- **Guild Wars**: Competições entre guildas
- **Relíquias e Artefatos**: Itens especiais com passivas únicas
- **Sistema de Encantamentos**: Melhorar equipamentos
- **Craft Avançado**: Receitas em árvore com especializações

## Licença

MIT
