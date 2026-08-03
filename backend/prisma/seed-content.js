// Seed content: starter classes + promote Darkin to admin.
// Usage (with SSH tunnel on 54321):
//   $env:DATABASE_URL = "postgresql://postgres:CpyIKdUgBfuzBkFXkdxTOxnjwwPGORle@127.0.0.1:54321/railway"
//   node prisma/seed-content.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const starterClasses = [
  {
    name: "Cavaleiro",
    slug: "cavaleiro",
    description: "O escudo inabalável do grupo. Suporta danos massivos e protege os aliados na linha de frente.",
    lore: "Forjado nas frentes de batalha, o Cavaleiro jura proteger os fracos com sua armadura pesada e sua coragem inabalável.",
    icon: "Shield",
    element: "light",
    rarity: "common",
    difficulty: "easy",
    role: "tank",
    statModel: "tank",
    unlockMethod: "auto",
    requiredLevel: 1,
    baseHp: 180,
    baseMana: 40,
    baseAttack: 10,
    baseDefense: 18,
    baseMagic: 6,
    baseMagicDefense: 14,
    baseSpeed: 8,
    manaRecovery: 3.0,
    attackScaling: 1.0,
    magicScaling: 0.4,
    critScaling: 0.03,
    critDamageBase: 130.0,
    dodgeScaling: 0.01,
    cooldownScaling: 0.0,
    manaEfficiency: 1.2,
  },
  {
    name: "Mago",
    slug: "mago",
    description: "Arcano devastador. Canaliza magias poderosas para destruir inimigos à distância — mas é frágil.",
    lore: "Estudioso dos mistérios arcanos, o Mago transforma conhecimento em pura destruição mágica.",
    icon: "Wand2",
    element: "fire",
    rarity: "common",
    difficulty: "medium",
    role: "mage",
    statModel: "caster",
    unlockMethod: "auto",
    requiredLevel: 1,
    baseHp: 90,
    baseMana: 140,
    baseAttack: 6,
    baseDefense: 6,
    baseMagic: 20,
    baseMagicDefense: 12,
    baseSpeed: 9,
    manaRecovery: 8.0,
    attackScaling: 0.3,
    magicScaling: 1.4,
    critScaling: 0.06,
    critDamageBase: 160.0,
    dodgeScaling: 0.01,
    cooldownScaling: 0.08,
    manaEfficiency: 0.9,
  },
  {
    name: "Assassino",
    slug: "assassino",
    description: "Sombra mortal. Golpes rápidos e críticos devastadores que eliminam alvos antes que reajam.",
    lore: "Treinado nas sombras, o Assassino não é visto nem ouvido — apenas sentido na hora final.",
    icon: "Swords",
    element: "dark",
    rarity: "common",
    difficulty: "hard",
    role: "assassin",
    statModel: "dps",
    unlockMethod: "auto",
    requiredLevel: 1,
    baseHp: 110,
    baseMana: 60,
    baseAttack: 16,
    baseDefense: 8,
    baseMagic: 5,
    baseMagicDefense: 8,
    baseSpeed: 16,
    manaRecovery: 5.0,
    attackScaling: 1.3,
    magicScaling: 0.2,
    critScaling: 0.12,
    critDamageBase: 190.0,
    dodgeScaling: 0.06,
    cooldownScaling: 0.04,
    manaEfficiency: 1.0,
  },
  {
    name: "Suporte",
    slug: "suporte",
    description: "Coração do grupo. Cura aliados, concede buffs poderosos e mantém a equipe viva nas piores lutas.",
    lore: "Há quem lute com espada; o Suporte luta para que ninguém precise cair. Sua magia sustenta esperança.",
    icon: "HeartPulse",
    element: "light",
    rarity: "common",
    difficulty: "medium",
    role: "support",
    statModel: "support",
    unlockMethod: "auto",
    requiredLevel: 1,
    baseHp: 120,
    baseMana: 120,
    baseAttack: 7,
    baseDefense: 10,
    baseMagic: 14,
    baseMagicDefense: 14,
    baseSpeed: 10,
    manaRecovery: 7.0,
    attackScaling: 0.4,
    magicScaling: 1.1,
    critScaling: 0.04,
    critDamageBase: 140.0,
    dodgeScaling: 0.02,
    cooldownScaling: 0.06,
    manaEfficiency: 0.95,
  },
];

// ===== World content: items, monsters, maps, npcs, shops, quests, skills, buffs, passives, codes =====

const items = [
  { name: "Espada de Iniciante", description: "Uma espada simples forjada para novos aventureiros.", type: "weapon", subtype: "sword", rarity: "common", level: 1, buyPrice: 50, sellPrice: 10, stats: '{"attack": 5}' },
  { name: "Adaga de Iniciante", description: "Leve e afiada, ideal para golpes precisos.", type: "weapon", subtype: "dagger", rarity: "common", level: 1, buyPrice: 50, sellPrice: 10, stats: '{"attack": 4, "criticalChance": 3}' },
  { name: "Cajado do Aprendiz", description: "Canaliza os primeiros feitiços de um mago.", type: "weapon", subtype: "staff", rarity: "common", level: 1, buyPrice: 50, sellPrice: 10, stats: '{"magic": 6}' },
  { name: "Cajado da Luz", description: "Um cajado abençoado que fortalece as curas.", type: "weapon", subtype: "staff", rarity: "common", level: 1, buyPrice: 50, sellPrice: 10, stats: '{"magic": 5, "healingPower": 3}' },
  { name: "Escudo de Madeira", description: "Um escudo robusto que absorve golpes.", type: "shield", subtype: "shield", rarity: "common", level: 1, buyPrice: 40, sellPrice: 8, stats: '{"defense": 5}' },
  { name: "Poção de Vida", description: "Restaura 50 de vida.", type: "consumable", subtype: "potion", rarity: "common", level: 1, isStackable: true, maxStack: 99, buyPrice: 20, sellPrice: 4, effects: '{"heal": 50}' },
  { name: "Poção de Mana", description: "Restaura 40 de mana.", type: "consumable", subtype: "potion", rarity: "common", level: 1, isStackable: true, maxStack: 99, buyPrice: 25, sellPrice: 5, effects: '{"manaRestore": 40}' },
  // Shop test gear
  { name: "Espada de Ferro", description: "Uma espada de ferro confiável para aventureiros iniciantes.", type: "weapon", subtype: "sword", rarity: "uncommon", level: 3, buyPrice: 150, sellPrice: 30, stats: '{"attack": 10}' },
  { name: "Adaga Serrilhada", description: "Lâmina serrilhada que causa ferimentos graves.", type: "weapon", subtype: "dagger", rarity: "uncommon", level: 3, buyPrice: 140, sellPrice: 28, stats: '{"attack": 9, "criticalChance": 5}' },
  { name: "Cajado Arcano", description: "Canaliza poder arcano com precisão.", type: "weapon", subtype: "staff", rarity: "uncommon", level: 3, buyPrice: 160, sellPrice: 32, stats: '{"magic": 12}' },
  { name: "Armadura de Couro", description: "Proteção leve e resistente.", type: "chestplate", subtype: "leather", rarity: "uncommon", level: 2, buyPrice: 120, sellPrice: 24, stats: '{"defense": 8, "maxHp": 20}' },
];

const monsters = [
  { name: "Rato da Floresta", description: "Um roedor feroz que invade acampamentos.", level: 1, hp: 30, mana: 0, attack: 6, defense: 2, magic: 0, magicDefense: 2, speed: 10, xpReward: 20, goldReward: 8, attackSpeed: 2000, drops: [{ item: "Poção de Vida", chance: 30, min: 1, max: 2 }] },
  { name: "Slime Verde", description: "Gosma gelatinosa comum nas florestas.", level: 1, hp: 25, mana: 0, attack: 5, defense: 3, magic: 0, magicDefense: 2, speed: 5, xpReward: 15, goldReward: 5, attackSpeed: 2500, drops: [{ item: "Poção de Mana", chance: 25, min: 1, max: 1 }] },
  { name: "Lobo Cinzento", description: "Um predador veloz que caça em matilha.", level: 2, hp: 45, mana: 0, attack: 9, defense: 4, magic: 0, magicDefense: 3, speed: 14, xpReward: 35, goldReward: 15, attackSpeed: 1800, drops: [{ item: "Poção de Vida", chance: 40, min: 1, max: 2 }, { item: "Espada de Ferro", chance: 8, min: 1, max: 1 }] },
  { name: "Goblin Saqueador", description: "Pequeno, covarde e perigoso com sua adaga.", level: 3, hp: 60, mana: 10, attack: 12, defense: 5, magic: 2, magicDefense: 3, speed: 12, xpReward: 60, goldReward: 25, attackSpeed: 1600, drops: [{ item: "Poção de Vida", chance: 30, min: 1, max: 1 }, { item: "Adaga Serrilhada", chance: 10, min: 1, max: 1 }] },
  { name: "Goblin Bruxo", description: "O chefe goblin que comanda a floresta com magia negra. Derrotá-lo concede recompensas em dobro.", level: 4, hp: 130, mana: 30, attack: 16, defense: 7, magic: 9, magicDefense: 6, speed: 10, xpReward: 200, goldReward: 80, attackSpeed: 1500, isBoss: true, drops: [{ item: "Cajado Arcano", chance: 25, min: 1, max: 1 }, { item: "Poção de Vida", chance: 50, min: 2, max: 3 }] },
];

const maps = [
  {
    name: "Arcádia — Vila Inicial",
    slug: "arcadia",
    description: "Uma vila tranquila onde sua jornada começa. Fale com o Mestre Branko para missões e visite a loja da Aurelia.",
    region: "Reino de Arcádia",
    requiredLevel: 1,
    sortOrder: 1,
  },
  {
    name: "Floresta Sombria",
    slug: "floresta-sombria",
    description: "Uma floresta densa infestada de ratos, slimes, lobos e goblins. Ótimo lugar para treinar.",
    region: "Reino de Arcádia",
    requiredLevel: 1,
    sortOrder: 2,
  },
];

const npcs = [
  { name: "Aurelia", description: "Vendedora de poções e equipamentos da vila.", type: "vendor", dialogue: "Bem-vindo à minha loja, aventureiro!" },
  { name: "Mestre Branko", description: "Um velho veterano que dá missões aos novatos.", type: "quest_giver", dialogue: "Precisa de trabalho? Tenho algumas tarefas para você." },
];

const shopOffers = [
  { npc: "Aurelia", item: "Poção de Vida", price: 20 },
  { npc: "Aurelia", item: "Poção de Mana", price: 25 },
  { npc: "Aurelia", item: "Espada de Ferro", price: 150 },
  { npc: "Aurelia", item: "Adaga Serrilhada", price: 140 },
  { npc: "Aurelia", item: "Cajado Arcano", price: 160 },
  { npc: "Aurelia", item: "Armadura de Couro", price: 120 },
];

const quests = [
  {
    title: "Caçada na Floresta",
    description: "A floresta está infestada de ratos. Elimine 5 Ratos da Floresta para Mestre Branko.",
    type: "main",
    difficulty: "easy",
    requiredLevel: 1,
    giverNpc: "Mestre Branko",
    map: "floresta-sombria",
    objectives: [{ id: "ratos", type: "kill", monsterName: "Rato da Floresta", amount: 5 }],
    xpReward: 100,
    goldReward: 50,
    itemRewards: [{ itemName: "Poção de Vida", quantity: 2 }],
  },
  {
    title: "Lobos à Solta",
    description: "Os lobos estão atacando viajantes. Elimine 3 Lobos Cinzentos.",
    type: "side",
    difficulty: "medium",
    requiredLevel: 1,
    giverNpc: "Mestre Branko",
    map: "floresta-sombria",
    objectives: [{ id: "lobos", type: "kill", monsterName: "Lobo Cinzento", amount: 3 }],
    xpReward: 150,
    goldReward: 80,
    itemRewards: [{ itemName: "Poção de Mana", quantity: 3 }],
  },
  {
    title: "Slimes em Excesso",
    description: "Os slimes estão tomando conta da floresta. Elimine 5 Slimes Verdes.",
    type: "daily",
    difficulty: "easy",
    requiredLevel: 1,
    giverNpc: "Mestre Branko",
    map: "floresta-sombria",
    isRepeatable: true,
    objectives: [{ id: "slimes", type: "kill", monsterName: "Slime Verde", amount: 5 }],
    xpReward: 80,
    goldReward: 40,
  },
  {
    title: "O Chefe dos Goblins",
    description: "Um Goblin Bruxo assumiu o controle da floresta. Elimine-o para provar seu valor.",
    type: "main",
    difficulty: "hard",
    requiredLevel: 3,
    requiredRank: 2,
    requires: ["Caçada na Floresta"],
    giverNpc: "Mestre Branko",
    map: "floresta-sombria",
    objectives: [{ id: "boss", type: "kill", monsterName: "Goblin Bruxo", amount: 1 }],
    xpReward: 400,
    goldReward: 200,
    itemRewards: [{ itemName: "Cajado Arcano", quantity: 1 }],
  },
];

// Efeitos (buff/debuff/hot/dot) — referenciados por slug nas ações das skills
const effects = [
  { name: "Fúria do Guerreiro", slug: "furia-do-guerreiro", description: "Aumenta o ataque.", kind: "buff", category: "stat", duration: 15000, maxStacks: 3, refreshBehavior: "stack", statModifiers: { flat: { attack: 5 } } },
  { name: "Armadura Arcana", slug: "armadura-arcana", description: "Aumenta a defesa.", kind: "buff", category: "stat", duration: 20000, maxStacks: 2, refreshBehavior: "stack", statModifiers: { flat: { defense: 6 } } },
  { name: "Passo das Sombras", slug: "passo-das-sombras", description: "Aumenta a esquiva.", kind: "buff", category: "stat", duration: 12000, maxStacks: 2, refreshBehavior: "stack", statModifiers: { flat: { dodge: 10 } } },
  { name: "Foco Arcano", slug: "foco-arcano", description: "Aumenta a recuperação de mana.", kind: "buff", category: "stat", duration: 20000, maxStacks: 3, refreshBehavior: "stack", statModifiers: { flat: { manaRegenPerTick: 5 } } },
  { name: "Bênção da Luz", slug: "bencao-da-luz", description: "Regenera vida ao longo do tempo.", kind: "hot", category: "healing", duration: 15000, tickInterval: 3000, tickHealing: { base: 12, scaling: [{ stat: "magic", factor: 0.6 }] } },
  { name: "Sangramento", slug: "sangramento", description: "Causa dano ao longo do tempo.", kind: "dot", category: "damage", duration: 10000, tickInterval: 2000, tickDamage: { base: 6, scaling: [{ stat: "attack", factor: 0.4 }], damageType: "physical" }, maxStacks: 3, refreshBehavior: "stack" },
  { name: "Chama Arcana", slug: "chama-arcana", description: "Queima o alvo com fogo arcano.", kind: "dot", category: "damage", duration: 12000, tickInterval: 2000, tickDamage: { base: 7, scaling: [{ stat: "magic", factor: 0.5 }], damageType: "magic" }, maxStacks: 4, refreshBehavior: "stack" },
  { name: "Veneno Corrosivo", slug: "veneno-corrosivo", description: "Veneno que corrói o alvo lentamente.", kind: "dot", category: "damage", duration: 12000, tickInterval: 2000, tickDamage: { base: 5, scaling: [{ stat: "attack", factor: 0.3 }], damageType: "physical" }, maxStacks: 5, refreshBehavior: "stack" },
];

// Skill kit por classe: 1 auto + 3 ativas + 1 ultimate (rankRequired), 3 passivas em `passives`.
// Ranks: auto=1, skill1=1, skill2=3, skill3=5, ultimate=8 | passivas: 1/4/7
// Ações: { action: "damage"|"heal"|"applyEffect"|"mana"|..., ...params } — DSL do motor de batalha.
const classSkills = [
  {
    class: "cavaleiro",
    skills: [
      { name: "Ataque do Cavaleiro", slug: "ataque-do-cavaleiro", description: "Golpeia o inimigo com a espada. Usado automaticamente.", kind: "attack", trigger: "auto", target: "enemy", cooldown: 2000, manaCost: 0, rankRequired: 1, sortOrder: 1, actions: [{ action: "damage", amount: 6, scaling: [{ stat: "attack", factor: 1 }], damageType: "physical" }] },
      { name: "Golpe de Escudo", slug: "golpe-de-escudo", description: "Golpeia o inimigo com o escudo, causando dano físico e erguendo uma barreira.", kind: "attack", trigger: "active", target: "enemy", cooldown: 3000, manaCost: 8, rankRequired: 1, sortOrder: 2, actions: [{ action: "damage", amount: 10, scaling: [{ stat: "attack", factor: 0.8 }], damageType: "physical" }, { action: "applyEffect", effect: "armadura-arcana", target: "self", stacks: 1 }] },
      { name: "Postura Defensiva", slug: "postura-defensiva", description: "Ergue uma barreira arcana que aumenta sua defesa.", kind: "buff", trigger: "active", target: "self", cooldown: 10000, manaCost: 10, rankRequired: 3, sortOrder: 3, actions: [{ action: "applyEffect", effect: "armadura-arcana", target: "self", stacks: 2 }] },
      { name: "Grito de Guerra", slug: "grito-de-guerra", description: "Berro de batalha que aumenta seu ataque.", kind: "buff", trigger: "active", target: "self", cooldown: 15000, manaCost: 12, rankRequired: 5, sortOrder: 4, actions: [{ action: "applyEffect", effect: "furia-do-guerreiro", target: "self", stacks: 2 }] },
      { name: "Juízo Final", slug: "juizo-final", description: "Um golpe devastador que abala a terra.", kind: "attack", trigger: "ultimate", target: "enemy", cooldown: 30000, manaCost: 25, rankRequired: 8, sortOrder: 5, actions: [{ action: "damage", amount: 40, scaling: [{ stat: "attack", factor: 1.5 }], damageType: "physical" }] },
    ],
    passives: [
      { name: "Bastião", slug: "bastiao", description: "Vida máxima +10% e defesa +5.", rankRequired: 1, sortOrder: 1, statModifiers: { percent: { hp: 10 }, flat: { defense: 5 } } },
      { name: "Muralha de Ferro", slug: "muralha-de-ferro", description: "Defesa +8 e resistência mágica +5.", rankRequired: 4, sortOrder: 2, statModifiers: { flat: { defense: 8, magicDefense: 5 } } },
      { name: "Espírito Inabalável", slug: "espirito-inabalavel", description: "Vida máxima +8% e recupera vida por rodada.", rankRequired: 7, sortOrder: 3, statModifiers: { percent: { hp: 8, healthRegenPerTick: 1 } } },
    ],
  },
  {
    class: "mago",
    skills: [
      { name: "Rajada Arcana", slug: "rajada-arcana", description: "Dispara um projétil de mana. Usado automaticamente.", kind: "attack", trigger: "auto", target: "enemy", cooldown: 2000, manaCost: 0, rankRequired: 1, sortOrder: 1, actions: [{ action: "damage", amount: 8, scaling: [{ stat: "magic", factor: 0.9 }], damageType: "magic" }] },
      { name: "Bola de Fogo", slug: "bola-de-fogo", description: "Lança uma esfera de fogo que causa dano mágico e queima o alvo.", kind: "attack", trigger: "active", target: "enemy", cooldown: 4000, manaCost: 15, rankRequired: 1, sortOrder: 2, actions: [{ action: "damage", amount: 16, scaling: [{ stat: "magic", factor: 1.2 }], damageType: "magic" }, { action: "applyEffect", effect: "chama-arcana", target: "enemy", stacks: 1 }] },
      { name: "Foco Arcano", slug: "foco-arcano", description: "Concentra energia arcana, aumentando a recuperação de mana.", kind: "buff", trigger: "active", target: "self", cooldown: 12000, manaCost: 10, rankRequired: 3, sortOrder: 3, actions: [{ action: "applyEffect", effect: "foco-arcano", target: "self", stacks: 2 }] },
      { name: "Raio Arcano", slug: "raio-arcano", description: "Um raio de energia pura que queima o alvo.", kind: "attack", trigger: "active", target: "enemy", cooldown: 9000, manaCost: 20, rankRequired: 5, sortOrder: 4, actions: [{ action: "damage", amount: 22, scaling: [{ stat: "magic", factor: 1.5 }], damageType: "magic" }, { action: "applyEffect", effect: "chama-arcana", target: "enemy", stacks: 1 }] },
      { name: "Meteoro", slug: "meteoro", description: "Invoca um meteoro que esmaga os inimigos.", kind: "attack", trigger: "ultimate", target: "enemy", cooldown: 30000, manaCost: 30, rankRequired: 8, sortOrder: 5, actions: [{ action: "damage", amount: 50, scaling: [{ stat: "magic", factor: 1.8 }], damageType: "magic" }] },
    ],
    passives: [
      { name: "Chama Interior", slug: "chama-interior", description: "Poder mágico +8.", rankRequired: 1, sortOrder: 1, statModifiers: { flat: { magic: 8 } } },
      { name: "Fluxo Arcano", slug: "fluxo-arcano", description: "Recuperação de mana +5 e poder mágico +4.", rankRequired: 4, sortOrder: 2, statModifiers: { flat: { manaRegenPerTick: 5, magic: 4 } } },
      { name: "Dominância Elemental", slug: "dominancia-elemental", description: "Dano mágico +12% e redução de custo de mana 10%.", rankRequired: 7, sortOrder: 3, statModifiers: { percent: { magicDamagePercent: 12, manaCostReduction: 10 } } },
    ],
  },
  {
    class: "assassino",
    skills: [
      { name: "Corte Rápido", slug: "corte-rapido", description: "Um corte veloz com as lâminas. Usado automaticamente.", kind: "attack", trigger: "auto", target: "enemy", cooldown: 2000, manaCost: 0, rankRequired: 1, sortOrder: 1, actions: [{ action: "damage", amount: 7, scaling: [{ stat: "attack", factor: 1 }], damageType: "physical" }] },
      { name: "Golpe Sombrio", slug: "golpe-sombrio", description: "Um ataque rápido vindo das sombras que causa sangramento.", kind: "attack", trigger: "active", target: "enemy", cooldown: 3500, manaCost: 10, rankRequired: 1, sortOrder: 2, actions: [{ action: "damage", amount: 12, scaling: [{ stat: "attack", factor: 1.1 }], damageType: "physical" }, { action: "applyEffect", effect: "sangramento", target: "enemy", stacks: 1 }] },
      { name: "Passo Sombrio", slug: "passo-sombrio", description: "Desliza entre as sombras, aumentando sua esquiva.", kind: "buff", trigger: "active", target: "self", cooldown: 12000, manaCost: 8, rankRequired: 3, sortOrder: 3, actions: [{ action: "applyEffect", effect: "passo-das-sombras", target: "self", stacks: 2 }] },
      { name: "Lâmina Envenenada", slug: "lamina-envenenada", description: "Envenena as lâminas e fere o alvo com veneno corrosivo.", kind: "attack", trigger: "active", target: "enemy", cooldown: 8000, manaCost: 14, rankRequired: 5, sortOrder: 4, actions: [{ action: "damage", amount: 15, scaling: [{ stat: "attack", factor: 1.3 }], damageType: "physical" }, { action: "applyEffect", effect: "veneno-corrosivo", target: "enemy", stacks: 1 }] },
      { name: "Execução", slug: "execucao", description: "Um golpe mortal que termina inimigos feridos.", kind: "attack", trigger: "ultimate", target: "enemy", cooldown: 25000, manaCost: 20, rankRequired: 8, sortOrder: 5, actions: [{ action: "damage", amount: 45, scaling: [{ stat: "attack", factor: 1.6 }], damageType: "physical" }] },
    ],
    passives: [
      { name: "Sangue Frio", slug: "sangue-frio", description: "Chance de crítico +5%.", rankRequired: 1, sortOrder: 1, statModifiers: { flat: { critChance: 5 } } },
      { name: "Sombra da Morte", slug: "sombra-da-morte", description: "Dano crítico +15% e chance de crítico +3%.", rankRequired: 4, sortOrder: 2, statModifiers: { flat: { critDamage: 15, critChance: 3 } } },
      { name: "Veneno Lento", slug: "veneno-lento", description: "Dano dos seus efeitos de dano contínuo +20%.", rankRequired: 7, sortOrder: 3, statModifiers: { percent: { dotPercent: 20 } } },
    ],
  },
  {
    class: "suporte",
    skills: [
      { name: "Luz Sagrada", slug: "luz-sagrada", description: "Dispara um feixe de luz que fere o inimigo. Usado automaticamente.", kind: "attack", trigger: "auto", target: "enemy", cooldown: 2000, manaCost: 0, rankRequired: 1, sortOrder: 1, actions: [{ action: "damage", amount: 7, scaling: [{ stat: "magic", factor: 0.7 }], damageType: "magic" }] },
      { name: "Toque Curativo", slug: "toque-curativo", description: "Cura com luz divina.", kind: "heal", trigger: "active", target: "self", cooldown: 4000, manaCost: 12, rankRequired: 1, sortOrder: 2, actions: [{ action: "heal", amount: 25, scaling: [{ stat: "magic", factor: 0.9 }] }] },
      { name: "Palavra de Poder", slug: "palavra-de-poder", description: "Encanta a si mesmo, aumentando seu ataque.", kind: "buff", trigger: "active", target: "self", cooldown: 10000, manaCost: 10, rankRequired: 3, sortOrder: 3, actions: [{ action: "applyEffect", effect: "furia-do-guerreiro", target: "self", stacks: 2 }] },
      { name: "Bênção da Luz", slug: "bencao-da-luz", description: "Abençoa a si mesmo, regenerando vida ao longo do tempo.", kind: "buff", trigger: "active", target: "self", cooldown: 15000, manaCost: 15, rankRequired: 5, sortOrder: 4, actions: [{ action: "applyEffect", effect: "bencao-da-luz", target: "self", stacks: 1 }] },
      { name: "Milagre", slug: "milagre", description: "Uma cura massiva que restaura grande parte da vida.", kind: "heal", trigger: "ultimate", target: "self", cooldown: 30000, manaCost: 30, rankRequired: 8, sortOrder: 5, actions: [{ action: "heal", amount: 80, scaling: [{ stat: "magic", factor: 1.5 }] }] },
    ],
    passives: [
      { name: "Piedade", slug: "piedade", description: "Poder de cura +10%.", rankRequired: 1, sortOrder: 1, statModifiers: { percent: { healingPercent: 10 } } },
      { name: "Graça Divina", slug: "graca-divina", description: "Recuperação de mana +4 e poder de cura +8%.", rankRequired: 4, sortOrder: 2, statModifiers: { flat: { manaRegenPerTick: 4 }, percent: { healingPercent: 8 } } },
      { name: "Sacrifício", slug: "sacrificio", description: "Suas curas podem exceder a vida máxima em até 10%.", rankRequired: 7, sortOrder: 3, statModifiers: { percent: { overhealPercent: 10 } } },
    ],
  },
  {
    class: "senhor-das-sombras",
    skills: [
      { name: "Corte Sombrio", slug: "corte-sombrio", description: "Um corte veloz tingido de sombras. Usado automaticamente.", kind: "attack", trigger: "auto", target: "enemy", cooldown: 2000, manaCost: 0, rankRequired: 1, sortOrder: 1, actions: [{ action: "damage", amount: 8, scaling: [{ stat: "attack", factor: 1.05 }], damageType: "physical" }] },
      { name: "Lâmina da Penumbra", slug: "lamina-da-penumbra", description: "Fere o inimigo com uma lâmina sombria que causa sangramento.", kind: "attack", trigger: "active", target: "enemy", cooldown: 3500, manaCost: 10, rankRequired: 1, sortOrder: 2, actions: [{ action: "damage", amount: 13, scaling: [{ stat: "attack", factor: 1.15 }], damageType: "physical" }, { action: "applyEffect", effect: "sangramento", target: "enemy", stacks: 1 }] },
      { name: "Manto Sombrio", slug: "manto-sombrio", description: "Envolve-se em sombras, aumentando a esquiva e a defesa.", kind: "buff", trigger: "active", target: "self", cooldown: 12000, manaCost: 10, rankRequired: 3, sortOrder: 3, actions: [{ action: "applyEffect", effect: "passo-das-sombras", target: "self", stacks: 1 }, { action: "applyEffect", effect: "armadura-arcana", target: "self", stacks: 1 }] },
      { name: "Garra Corrosiva", slug: "garra-corrosiva", description: "Golpeia com garras envenenadas, causando veneno corrosivo.", kind: "attack", trigger: "active", target: "enemy", cooldown: 8000, manaCost: 14, rankRequired: 5, sortOrder: 4, actions: [{ action: "damage", amount: 16, scaling: [{ stat: "attack", factor: 1.35 }], damageType: "physical" }, { action: "applyEffect", effect: "veneno-corrosivo", target: "enemy", stacks: 1 }] },
      { name: "Tempestade das Sombras", slug: "tempestade-das-sombras", description: "Libera toda a escuridão acumulada em um golpe devastador.", kind: "attack", trigger: "ultimate", target: "enemy", cooldown: 30000, manaCost: 28, rankRequired: 8, sortOrder: 5, actions: [{ action: "damage", amount: 55, scaling: [{ stat: "attack", factor: 1.7 }], damageType: "physical" }, { action: "applyEffect", effect: "furia-do-guerreiro", target: "self", stacks: 2 }] },
    ],
    passives: [
      { name: "Sombra Persistente", slug: "sombra-persistente", description: "Chance de crítico +5%.", rankRequired: 1, sortOrder: 1, statModifiers: { flat: { critChance: 5 } } },
      { name: "Abraço Noturno", slug: "abraco-noturno", description: "Vida máxima +8% e defesa +5.", rankRequired: 4, sortOrder: 2, statModifiers: { percent: { hp: 8 }, flat: { defense: 5 } } },
      { name: "Senhor da Penumbra", slug: "senhor-da-penumbra", description: "Dano contínuo +15% e esquiva +5%.", rankRequired: 7, sortOrder: 3, statModifiers: { percent: { dotPercent: 15, dodge: 5 } } },
    ],
  },
];

const redeemCodes = [
  {
    code: "BEMVINDO",
    description: "Kit de boas-vindas: 100 gold, 50 diamantes, 100 XP e poções.",
    gold: 100,
    diamonds: 50,
    experience: 100,
    items: [{ itemName: "Poção de Vida", quantity: 5 }, { itemName: "Poção de Mana", quantity: 3 }],
    maxUses: 500,
  },
  {
    code: "ARCADIA2026",
    description: "Bônus de teste: 500 gold, 25 diamantes e 250 XP.",
    gold: 500,
    diamonds: 25,
    experience: 250,
    items: [],
    maxUses: 500,
  },
];

// ===== Classe exclusiva VIP (desbloqueada comprando VIP; não é starter) =====

const vipClasses = [
  {
    name: "Senhor das Sombras",
    slug: "senhor-das-sombras",
    description: "Classe exclusiva VIP. Um híbrido de dano e resistência que domina a escuridão, sangra e corrói seus inimigos.",
    lore: "Apenas aqueles que apoiam o reino conhecem os segredos da penumbra.",
    icon: "Moon",
    element: "dark",
    rarity: "rare",
    difficulty: "medium",
    role: "tank",
    combatType: "melee",
    statModel: "hybrid",
    requiredLevel: 10,
    requiredVip: true,
    sortOrder: 6,
  },
];

// ===== Loja: diamantes (moeda real simulada), VIP e passe premium =====

const shopProducts = [
  { slug: "diamantes-100", name: "Pacote de Diamantes — 100", description: "100 diamantes para gastar na loja.", type: "diamond_pack", currency: "money", price: 500, diamondAmount: 100, icon: "Gem", sortOrder: 1 },
  { slug: "diamantes-550", name: "Pacote de Diamantes — 550", description: "550 diamantes (melhor custo-benefício).", type: "diamond_pack", currency: "money", price: 2500, diamondAmount: 550, icon: "Gem", sortOrder: 2 },
  { slug: "diamantes-1300", name: "Pacote de Diamantes — 1300", description: "1300 diamantes para os colecionadores.", type: "diamond_pack", currency: "money", price: 5000, diamondAmount: 1300, icon: "Gem", sortOrder: 3 },
  { slug: "vip-7d", name: "VIP — 7 dias", description: "VIP por 7 dias: +10% XP, +10% ouro e classe exclusiva Senhor das Sombras.", type: "vip", currency: "diamond", price: 300, vipDays: 7, icon: "Crown", sortOrder: 10 },
  { slug: "vip-30d", name: "VIP — 30 dias", description: "VIP por 30 dias: +10% XP, +10% ouro e classe exclusiva Senhor das Sombras.", type: "vip", currency: "diamond", price: 800, vipDays: 30, icon: "Crown", sortOrder: 11 },
  { slug: "vip-30d-cash", name: "VIP — 30 dias (R$)", description: "VIP por 30 dias comprado com dinheiro real.", type: "vip", currency: "money", price: 4000, vipDays: 30, icon: "Crown", sortOrder: 12 },
  { slug: "pass-premium", name: "Passe Premium", description: "Ativa o Passe Premium da temporada atual e libera as recompensas premium dos tiers.", type: "pass_premium", currency: "diamond", price: 600, icon: "Trophy", sortOrder: 20 },
  { slug: "pass-premium-cash", name: "Passe Premium (R$)", description: "Ativa o Passe Premium da temporada atual comprando com dinheiro real.", type: "pass_premium", currency: "money", price: 3000, icon: "Trophy", sortOrder: 21 },
];

async function upsertItem(item) {
  const existing = await prisma.item.findFirst({ where: { name: item.name } });
  if (existing) return prisma.item.update({ where: { id: existing.id }, data: { ...item } });
  return prisma.item.create({ data: { ...item } });
}

async function upsertMonster(monster) {
  const { drops, ...monsterData } = monster;
  const existing = await prisma.monster.findFirst({ where: { name: monster.name } });
  const created = existing
    ? await prisma.monster.update({ where: { id: existing.id }, data: { ...monsterData } })
    : await prisma.monster.create({ data: { ...monsterData } });
  if (Array.isArray(drops) && drops.length > 0) {
    await prisma.dropItem.deleteMany({ where: { monsterId: created.id } });
    for (const drop of drops) {
      const item = await prisma.item.findFirst({ where: { name: drop.item } });
      if (!item) continue;
      await prisma.dropItem.create({
        data: {
          monsterId: created.id,
          itemId: item.id,
          dropChance: drop.chance,
          minQuantity: drop.min || 1,
          maxQuantity: drop.max || drop.min || 1,
        },
      });
    }
  }
  return created;
}

async function upsertMap(map) {
  return prisma.map.upsert({
    where: { slug: map.slug },
    update: { ...map },
    create: { ...map },
  });
}

async function upsertNpc(npc) {
  const existing = await prisma.npc.findFirst({ where: { name: npc.name } });
  if (existing) return prisma.npc.update({ where: { id: existing.id }, data: { ...npc } });
  return prisma.npc.create({ data: { ...npc } });
}

async function upsertEffect(effect) {
  const existing = await prisma.effect.findFirst({
    where: { OR: [{ slug: effect.slug }, { name: effect.name }] },
  });
  const data = {
    name: effect.name,
    slug: effect.slug,
    description: effect.description || "",
    icon: effect.icon || null,
    kind: effect.kind || "buff",
    category: effect.category || "utility",
    maxStacks: effect.maxStacks || 1,
    duration: effect.duration || 0,
    refreshBehavior: effect.refreshBehavior || "refresh",
    stackLoss: effect.stackLoss || {},
    priority: effect.priority || 0,
    tickInterval: effect.tickInterval || 0,
    tickDamage: effect.tickDamage || {},
    tickHealing: effect.tickHealing || {},
    statModifiers: effect.statModifiers || {},
    shield: effect.shield || {},
    reflect: effect.reflect || {},
    hitkillChance: effect.hitkillChance ?? undefined,
    onMaxStacks: effect.onMaxStacks || [],
    onExpire: effect.onExpire || [],
    onTick: effect.onTick || [],
    exclusiveGroup: effect.exclusiveGroup || null,
    isActive: true,
  };
  if (existing) return prisma.effect.update({ where: { id: existing.id }, data });
  return prisma.effect.create({ data });
}

async function upsertQuest(quest, giverNpcId, mapId) {
  const existing = await prisma.quest.findFirst({ where: { title: quest.title } });
  const data = {
    title: quest.title,
    description: quest.description,
    type: quest.type,
    difficulty: quest.difficulty,
    requiredLevel: quest.requiredLevel || 1,
    requiredRank: quest.requiredRank || 1,
    giverNpcId,
    mapId,
    isRepeatable: !!quest.isRepeatable,
    objectives: JSON.stringify(quest.objectives || []),
    xpReward: BigInt(quest.xpReward || 0),
    goldReward: BigInt(quest.goldReward || 0),
    itemRewards: JSON.stringify(quest.itemRewards || []),
    isActive: true,
    sortOrder: quest.sortOrder || 0,
  };
  if (existing) return prisma.quest.update({ where: { id: existing.id }, data });
  return prisma.quest.create({ data });
}

async function upsertSkill(classId, skill) {
  const existing = await prisma.skill.findFirst({ where: { classId, name: skill.name } });
  const data = {
    name: skill.name,
    slug: skill.slug || skill.name.toLowerCase().replace(/\s+/g, "-"),
    description: skill.description,
    icon: skill.icon || null,
    kind: skill.kind || "attack",
    trigger: skill.trigger || "active",
    target: skill.target || "enemy",
    cooldown: skill.cooldown || 0,
    manaCost: skill.manaCost || 0,
    castTime: skill.castTime || 0,
    channelMs: skill.channelMs || 0,
    rankRequired: skill.rankRequired || 1,
    sortOrder: skill.sortOrder || 0,
    scaling: skill.scaling || [],
    actions: skill.actions || [],
    conditions: skill.conditions || [],
    onConditionMet: skill.onConditionMet || [],
    events: skill.events || [],
    isActive: true,
  };
  if (existing) return prisma.skill.update({ where: { id: existing.id }, data });
  return prisma.skill.create({ data: { ...data, classId } });
}

async function upsertPassive(classId, passive) {
  const existing = await prisma.passive.findFirst({ where: { classId, name: passive.name } });
  const data = {
    name: passive.name,
    slug: passive.slug || passive.name.toLowerCase().replace(/\s+/g, "-"),
    description: passive.description,
    icon: passive.icon || null,
    rankRequired: passive.rankRequired || 1,
    sortOrder: passive.sortOrder || 0,
    statModifiers: passive.statModifiers || {},
    skillModifiers: passive.skillModifiers || [],
    effectModifiers: passive.effectModifiers || [],
    conditions: passive.conditions || [],
    events: passive.events || [],
    isActive: true,
  };
  if (existing) return prisma.passive.update({ where: { id: existing.id }, data });
  return prisma.passive.create({ data: { ...data, classId } });
}

async function seedWorld() {
  console.log("Seeding items...");
  const itemMap = {};
  for (const item of items) {
    const created = await upsertItem(item);
    itemMap[item.name] = created;
    console.log("  item:", item.name);
  }

  console.log("Seeding monsters...");
  const monsterMap = {};
  for (const monster of monsters) {
    const created = await upsertMonster(monster);
    monsterMap[monster.name] = created;
    console.log("  monster:", monster.name);
  }

  console.log("Seeding maps...");
  const mapMap = {};
  for (const map of maps) {
    const created = await upsertMap(map);
    mapMap[map.slug] = created;
    console.log("  map:", map.slug);
  }

  // Map connection: Arcádia <-> Floresta Sombria
  const existingConn = await prisma.mapConnection.findFirst({
    where: { fromMapId: mapMap.arcadia.id, toMapId: mapMap["floresta-sombria"].id },
  });
  if (!existingConn) {
    await prisma.mapConnection.create({
      data: { fromMapId: mapMap.arcadia.id, toMapId: mapMap["floresta-sombria"].id, requiredLevel: 1 },
    });
    console.log("  connection: arcadia -> floresta-sombria");
  }

  // Map monsters
  for (const [mapSlug, names] of Object.entries({
    "floresta-sombria": ["Rato da Floresta", "Slime Verde", "Lobo Cinzento", "Goblin Saqueador", "Goblin Bruxo"],
    arcadia: ["Rato da Floresta", "Slime Verde"],
  })) {
    for (const name of names) {
      const existing = await prisma.mapMonster.findFirst({
        where: { mapId: mapMap[mapSlug].id, monsterId: monsterMap[name].id },
      });
      if (!existing) {
        await prisma.mapMonster.create({
          data: { mapId: mapMap[mapSlug].id, monsterId: monsterMap[name].id, spawnRate: 100, minLevel: 1, maxLevel: 10 },
        });
        console.log(`  mapMonster: ${mapSlug} -> ${name}`);
      }
    }
  }

  console.log("Seeding npcs...");
  const npcMap = {};
  for (const npc of npcs) {
    const created = await upsertNpc(npc);
    npcMap[npc.name] = created;
    console.log("  npc:", npc.name);
  }

  // Map npcs (Arcádia)
  for (const npc of Object.values(npcMap)) {
    const existing = await prisma.mapNpc.findFirst({
      where: { mapId: mapMap.arcadia.id, npcId: npc.id },
    });
    if (!existing) {
      await prisma.mapNpc.create({ data: { mapId: mapMap.arcadia.id, npcId: npc.id } });
      console.log("  mapNpc: arcadia ->", npc.name);
    }
  }

  console.log("Seeding shop...");
  for (const offer of shopOffers) {
    const npc = npcMap[offer.npc];
    const item = itemMap[offer.item];
    if (!npc || !item) continue;
    const existing = await prisma.shopItem.findFirst({ where: { npcId: npc.id, itemId: item.id } });
    if (!existing) {
      await prisma.shopItem.create({
        data: { npcId: npc.id, itemId: item.id, price: BigInt(offer.price), currency: "gold" },
      });
      console.log("  shop:", offer.npc, "->", offer.item);
    }
  }

  console.log("Seeding quests...");
  const questMap = {};
  for (const quest of quests) {
    const created = await upsertQuest(quest, npcMap[quest.giverNpc]?.id ?? null, mapMap[quest.map]?.id ?? null);
    questMap[quest.title] = created;
    console.log("  quest:", created.title);
  }
  // Encadeamento de quests (resolvido por título, em duas passadas)
  for (const quest of quests) {
    if (!Array.isArray(quest.requires) || quest.requires.length === 0) continue;
    const id = questMap[quest.title]?.id;
    if (!id) continue;
    const reqIds = quest.requires.map((t) => questMap[t]?.id).filter(Boolean);
    if (reqIds.length > 0) {
      await prisma.quest.update({ where: { id }, data: { requiredQuestIds: JSON.stringify(reqIds) } });
      console.log("  chain:", quest.title, "<-", quest.requires.join(", "));
    }
  }

  console.log("Seeding effects...");
  const effectMap = {};
  for (const effect of effects) {
    const created = await upsertEffect(effect);
    effectMap[effect.slug] = created;
    console.log("  effect:", effect.slug);
  }

  console.log("Seeding skills & passives...");
  for (const entry of classSkills) {
    const cls = await prisma.gameClass.findUnique({ where: { slug: entry.class } });
    if (!cls) {
      console.log("  SKIP class not found:", entry.class);
      continue;
    }
    for (const skill of entry.skills) {
      const created = await upsertSkill(cls.id, skill);
      console.log("  skill:", entry.class, "->", created.name);
    }
    for (const passive of entry.passives) {
      await upsertPassive(cls.id, passive);
      console.log("  passive:", entry.class, "->", passive.name);
    }
  }

  console.log("Seeding redeem codes...");
  for (const code of redeemCodes) {
    const created = await prisma.redeemCode.upsert({
      where: { code: code.code },
      update: { ...code, items: code.items },
      create: { ...code, items: code.items },
    });
    console.log("  code:", created.code);
  }
}async function main() {
  console.log("Seeding starter classes...");
  for (const cls of starterClasses) {
    const statModel = cls.statModel
      ? await prisma.statModel.findFirst({ where: { slug: cls.statModel } })
      : null;
    const data = {
      name: cls.name,
      slug: cls.slug,
      description: cls.description,
      icon: cls.icon,
      role: cls.role,
      combatType: cls.combatType || "melee",
      rankMax: cls.rankMax || 10,
      requiredLevel: cls.requiredLevel || 1,
      resource: cls.resource || {},
      statModelId: statModel?.id ?? null,
      isStarter: true,
      isActive: true,
      sortOrder: cls.sortOrder || 0,
    };
    await prisma.gameClass.upsert({
      where: { slug: cls.slug },
      update: data,
      create: data,
    });
    console.log("  class:", cls.slug);
  }


  console.log("Seeding VIP class...");
  for (const cls of vipClasses) {
    const statModel = await prisma.statModel.findFirst({ where: { slug: cls.statModel } });
    const data = {
      name: cls.name,
      slug: cls.slug,
      description: cls.description,
      icon: cls.icon,
      role: cls.role,
      combatType: cls.combatType || "melee",
      rankMax: cls.rankMax || 10,
      requiredLevel: cls.requiredLevel || 1,
      requiredVip: true,
      resource: cls.resource || {},
      statModelId: statModel?.id ?? null,
      isStarter: false,
      isActive: true,
      sortOrder: cls.sortOrder || 5,
    };
    await prisma.gameClass.upsert({
      where: { slug: cls.slug },
      update: data,
      create: data,
    });
    console.log("  class:", cls.slug);
  }

  console.log("Promoting Darkin to admin...");
  const darkin = await prisma.user.updateMany({
    where: { username: "Darkin" },
    data: { role: "admin" },
  });
  console.log("  users updated:", darkin.count);

  await seedWorld();

  console.log("Seeding shop products...");
  for (const product of shopProducts) {
    const created = await prisma.shopProduct.upsert({
      where: { slug: product.slug },
      update: { ...product },
      create: { ...product },
    });
    console.log("  product:", created.slug);
  }

  const [classes, users] = await Promise.all([
    prisma.gameClass.count(),
    prisma.user.findMany({ select: { username: true, role: true } }),
  ]);
  console.log("DONE. classes:", classes);
  console.log("users:", JSON.stringify(users));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

