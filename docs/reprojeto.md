# Proposta de Reprojeto — RPG Story Life

> Documento de análise e proposta. Aguarda aprovação antes de virar plano de trabalho.
> Contexto: inspirado em AQW (classe como "armadura"), mas original e 100% data-driven.

---

## 1. Diagnóstico do estado atual

### O que já existe e é a fundação (NÃO jogar fora)

- **classEngine** (`backend/src/core/classEngine/`): motor de combate data-driven e a única coisa que importa do código antigo.
  - `StatsInput` + `StatModel` (`base`, `perLevel`, `scaling`) → `DerivedStats` (hp, mana, atk, def, mag, magDef, speed, crit, dodge, cooldownReduction, manaRegen, etc.).
  - `SkillDef` com DSL de actions (`damage`, `heal`, `shield`, `reflect`, `hitkill`, `dot`, `statModifiers` flat/percent).
  - `PassiveDef` com `statModifiers` (flat/percent) e gates por `rankRequired`.
  - `EffectDef` com stacks, `stackLoss`, `tickDamage/tickHealing`, `onMaxStacks`, `onExpire`, `onTick`, `shield`/`reflect`/`hitkillChance`.
  - `applyStatModifiers()` aplica mods de passivas e efeitos ativos em runtime.
- **Rank por classe** (`CharacterClass`): jogador "equipa" 1 classe ativa (`isActive`), ganha rank/XP nela, troca livremente. Isso já é o núcleo AQW-like.
- **Schema Prisma rico** (43 modelos): mundo (Map/MapConnection/MapMonster/MapNpc), economia (Item/Enchantment/GemSlot/RuneSlot/Inventory/Equipment/MarketListing), social (Guild/GuildBank/GuildPerk/GuildQuest/GuildRanking, Friendship, Party, Mail, Title), progressão (Quest/QuestProgress, Achievement, Season/SeasonPass/SeasonTier), logística (CombatLog/ChatLog/GameLog/AnalyticsEvent), monetização (RedeemCode).
- **Admin funcional**: CRUD genérico de tudo (classes, skills, items, monsters, maps, quests, effects, npcs, shops, stat models, users, codes, limites) + editor custom de Effect com StatModifierEditor; dashboard com contagens; painel de usuários com edição de personagem.
- **Frontend enxuto**: 14 páginas reais (Login, Register, CreateCharacter, Dashboard, Class, Combat, Inventory, Market, Quest, Map, Guild, Codex, Settings, Support), tudo roteado, sem páginas órfãs.
- **Deploy**: Railway via `git push`, banco PostgreSQL prod com túnel local para `prisma db push`/seed.

### O que foi removido (limpeza concluída)

- Camadas mortas do backend (TypeORM, `src/api`, `src/shared`, `src/websocket`, `src/database`, `src/middleware`, `src/main.ts`, motores antigos de chat/quest/guild/mercado).
- HUDs e telas antigas do frontend (CombatScreen, AuthScreen, MainHUD, ChatPanel, MapScreen, stores órfãs, globals.css).
- Sistemas de **raça** e **trait** (schema, seed, admin, bônus de XP/ouro e stats) — banco já migrado.
- Duplicidade de nome: **nick da conta = nick do personagem** (register sem displayName; create de personagem só com classe).

### Limitações atuais (motivos do reprojeto)

1. **Combate 100% em memória**: `Battle` vive num mapa no servidor; refresh/troca de aba = perder o combate (só cooldowns vão ao Redis). Sem persistência de estado.
2. **Sem multiplayer real**: party/amizades existem no schema, mas o combate é estritamente solo.
3. **Quest simples**: sem cadeia de capítulos, requisitos de progressão (rank/quest anterior) ou recompensas complexas.
4. **Economia desconectada**: market/guild existem, mas não há loop que os integre ao farm (materiais de craft, leilão de drops, etc.).
5. **Conteúdo sem versionamento**: admin escreve direto no banco prod; não há export/import de "presets" de conteúdo nem teste antes de publicar.
6. **Feedback/UX de combate cru**: sem animação/transição de dano, sem "round summary", sem efeito visual de buff/debuff nos alvos.
7. **Sem onboarding**: após criar conta, o jogador cai num mundo sem direção (sem "seu primeiro monstro" / tutorial).
8. **Código duplicado de lógica de nível**: level de personagem e rank de classe têm regras espalhadas (`getGameLimits`, loops de level-up inline).

---

## 2. Visão do reprojeto

### Princípios

1. **Tudo é dado** — classes, skills, passives, effects, itens, monstros, mapas, quests, recompensas, sazonal: nada hardcoded. O game é jogável e editável 100% pelo admin.
2. **A classe é o personagem** — 1 classe ativa por vez (troca como "armadura"), rank/XP por classe, 3-4 skills + passivas próprias, identidade de playstyle real (tanque suga aggro, mago gasta mana e explode, assassino crita, suporte cura/amortiza).
3. **Loop principal** — Escolher mapa → farmar monstros → XP/gold/items/drops → subir rank de classe + nível → desbloquear skills/passivas → novos mapas/quests/chefes → equipamento melhor → classes novas. Tudo gera decisão curta (1-5 min de sessão de farm).
4. **Social/economia são secundários** — guild, market, amizades, títulos, conquistas existem e funcionam, mas não bloqueiam o loop.
5. **Estado mínimo, dados máximos** — o servidor guarda só o progresso do jogador; todo o "conteúdo" é leitura de tabelas editáveis.

### Experiência-alvo

1. Registro → cria nick → escolhe a 1ª classe (3 starters) → entra no mundo.
2. Tutorial de 2 minutos: um NPC mostra a tela de combate, a barra de skills, a poção e a fuga.
3. Farm: mapa com monstros visíveis, clique = batalha tick-based em tempo real; dano/cura com feedback; drops na tela.
4. Crescimento: barra de XP da classe, rank up com skill nova, missão de "chefe" a cada 5 ranks.
5. Classe nova desbloqueada em quest/chefe → trocar de classe = mudar playstyle inteiro (skins/armaduras).
6. Guild/market/season entram como camadas opcionais a partir do rank 5+.

---

## 3. Arquitetura alvo

### Backend (manter Express + Prisma + classEngine)

- **Persistência de combate**: novo modelo `CombatSession` (characterId, monsterId, battleState JSON com ticks/efeitos/hp atuais, lastTickAt). Serviço continua em memória, mas snapshot a cada N ticks; refresh restaura a sessão. (Alternativa leve: sessão em Redis com TTL — decidir.)
- **Catálogo público**: `GET /api/content` (classes+skills+passives, itens, monstros, mapas, quests resumidos) para Codex e jogo — substituir chamadas avulsas.
- **Level/rank unificados**: extrair `progression.ts` (xpToNext, applyXp, levelUp/rankUp) usado por combate, quests, redeem e admin — acaba com regras duplicadas.
- **Recompensas declarativas**: `reward` JSON em Monster/Quest (`{ xp, gold, items: [{itemSlug, qty, chance}], stats: {...} }`) aplicado por um único `grantRewards()`.
- **Content presets**: `SystemConfig` ganha chave `contentPreset` + endpoint admin de export/import JSON (classes/skills/itens/effect/monsters/maps/quests) — permite testar em staging e publicar em prod.
- **Módulo seasons** já existe no schema (`Season/SeasonPass/SeasonTier`) — implementar por último, reaproveitando o loop de recompensas.

### Frontend

- **Design tokens** (`tokens.css`: cores de raridade, dano/cura, painel, fonte) para parar com classes inline espalhadas.
- **Feedback de combate**: dano flutuante, glow de buff/debuff nos alvos, barra de cast/cooldown nos botões de skill, log colorido (danos em vermelho, curas em verde).
- **Fluxo de troca de classe** na Dashboard (trocar = novo visual na batalha) e tela de "suas classes" (rank, XP, progresso por classe).
- **Onboarding**: primeira visita → banner do NPC guia na Dashboard com passos (escolher classe → matar 1 monstro → subir rank).
- **Codex unificado**: consumir `/api/content` (classes, skills, itens, monstros por mapa).

### Admin

- **Simulador de combate**: editor de skill/effect com botão "testar" que roda o classEngine com stats de exemplo e mostra danos estimados (e.g., 10 autos + skill + crit médio).
- **Editor visual de DSL**: actions/skills com builder (add damage/heal/buff + campos) em vez de JSON cru (manter modo "avançado").
- **Export/import de presets** de conteúdo.
- **Filtros/paginação** nas listas CRUD (classes, items, quests já crescem).

---

## 4. Fases de implementação

| Fase | Escopo | Entrega |
|---|---|---|
| **0 — Fundação do reprojeto** | `progression.ts` unificado; `grantRewards()` declarativo; `GET /api/content`; design tokens frontend | Base estável para tudo que vem |
| **1 — Combate resiliente** | `CombatSession` persistido (snapshot + retomada pós-refresh); feedback visual (dano flutuante, cooldowns, log colorido) | Farm sem perder progresso; UX de batalha decente |
| **2 — Conteúdo rico** | Drops com chance (`DropItem`), chefes por mapa, quests encadeadas (requisitos: rank/quest/monster), recompensas declarativas | Loop de farm com direção e objetivos |
| **3 — Classes de verdade** | Skills exclusivas por identidade (3 starters + 2-3 classes desbloqueáveis), troca de classe na UI, passivas por rank revisadas | Diferença real entre playstyles |
| **4 — Social/economia** | Party com instância de combate compartilhada (opcional), guild quests, market integrado ao farm (vender drops), títulos/conquistas | Camadas sociais funcionando |
| **5 — Sazonal e polimento** | Season/Pass/Tiers com recompensas; onboarding tutorial; admin simulator + presets | Produto "completo" editável |

Cada fase termina com: backend + frontend compilando, `db push` aplicado, commit + push (deploy automático).

---

## 5. Decisões a confirmar

1. **Combate**: manter tick-based em tempo real (atual, já funciona) ou migrar para rodadas? → recomendo **manter tick-based**, só persistir snapshot.
2. **Persistência de combate**: snapshot em tabela (retomar em qualquer device) vs Redis com TTL (retomar na mesma sessão)? → recomendo **tabela** (simples, sem Redis extra além dos cooldowns).
3. **Party**: combate em grupo compartilhado é feature de Fase 4 ou cortado do escopo (só chat/companhia)? → recomendo **adiar, solo por enquanto**.
4. **Troca de classe**: manter livre (atual) ou com custo/cooldown? → recomendo **livre**, mas com rank mínimo por classe desbloqueável.
5. **Diamonds**: fonte única (redeem codes) ou ganhar em conquistas/season? → recomendo **season + conquistas + codes**.
6. **PvP**: fora do escopo por enquanto? → recomendo **fora**, schema de Friendship já cobre o social.

---

## 6. Riscos

- **Data loss em migrações** (ex.: nova tabela `CombatSession`): usar `prisma db push` com backup manual antes; seeds rodam por upsert.
- **Conteúdo editado em prod**: presets + export/import mitigam; admin ganha "só admins podem editar" (já existe `requireAdmin`).
- **Scope creep**: Fases 4-5 dependem de aprovação explícita; 0-3 são o "reprojeto" pedido.
