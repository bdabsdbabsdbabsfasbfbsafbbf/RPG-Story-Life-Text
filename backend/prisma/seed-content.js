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
    statModel: "powerCaster",
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
    statModel: "physicalDPS",
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
  { name: "Rato da Floresta", description: "Um roedor feroz que invade acampamentos.", level: 1, hp: 30, mana: 0, attack: 6, defense: 2, magic: 0, magicDefense: 2, speed: 10, xpReward: 20, goldReward: 8, attackSpeed: 2000 },
  { name: "Slime Verde", description: "Gosma gelatinosa comum nas florestas.", level: 1, hp: 25, mana: 0, attack: 5, defense: 3, magic: 0, magicDefense: 2, speed: 5, xpReward: 15, goldReward: 5, attackSpeed: 2500 },
  { name: "Lobo Cinzento", description: "Um predador veloz que caça em matilha.", level: 2, hp: 45, mana: 0, attack: 9, defense: 4, magic: 0, magicDefense: 3, speed: 14, xpReward: 35, goldReward: 15, attackSpeed: 1800 },
  { name: "Goblin Saqueador", description: "Pequeno, covarde e perigoso com sua adaga.", level: 3, hp: 60, mana: 10, attack: 12, defense: 5, magic: 2, magicDefense: 3, speed: 12, xpReward: 60, goldReward: 25, attackSpeed: 1600 },
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
];

const buffs = [
  { name: "Fúria do Guerreiro", description: "Aumenta o ataque.", type: "buff", duration: 15000, maxStacks: 3, statModifiers: '{"attack": 5}' },
  { name: "Armadura Arcana", description: "Aumenta a defesa.", type: "buff", duration: 20000, maxStacks: 2, statModifiers: '{"defense": 6}' },
  { name: "Passo das Sombras", description: "Aumenta a esquiva.", type: "buff", duration: 12000, maxStacks: 2, statModifiers: '{"dodge": 10}' },
  { name: "Foco Arcano", description: "Aumenta a recuperação de mana.", type: "buff", duration: 20000, maxStacks: 3, statModifiers: '{"manaRecovery": 5}' },
  { name: "Bênção da Luz", description: "Regenera vida ao longo do tempo.", type: "hot", duration: 15000, tickInterval: 3000, tickEffect: "heal", statModifiers: '{"regen": 8}' },
  { name: "Sangramento", description: "Causa dano ao longo do tempo.", type: "dot", duration: 10000, tickInterval: 2000, tickEffect: "damage", maxStacks: 3, statModifiers: '{"damagePerTick": 4}' },
  { name: "Chama Arcana", description: "Queima o alvo com fogo arcano.", type: "dot", duration: 12000, tickInterval: 2000, tickEffect: "damage", maxStacks: 4, statModifiers: '{"damagePerTick": 5}' },
  { name: "Veneno Corrosivo", description: "Veneno que corrói o alvo lentamente.", type: "dot", duration: 12000, tickInterval: 2000, tickEffect: "damage", maxStacks: 5, statModifiers: '{"damagePerTick": 3}' },
];

// Skill kit por classe: 1 auto + 3 ativas + 1 ultimate (rankRequired), 3 passivas em `passives`.
// Ranks: auto=1, skill1=1, skill2=3, skill3=5, ultimate=8 | passivas: 1/4/7
const classSkills = [
  {
    class: "cavaleiro",
    skills: [
      { name: "Ataque do Cavaleiro", description: "Golpeia o inimigo com a espada. Usado automaticamente.", type: "auto", subType: "melee", cooldown: 2000, manaCost: 0, range: 5, targetType: "enemy", baseDamage: 8, damageType: "physical", damageScaling: '{"attack": 1.0}', rankRequired: 1, sortOrder: 1 },
      { name: "Golpe de Escudo", description: "Golpeia o inimigo com o escudo, causando dano físico.", type: "active", subType: "melee", cooldown: 3000, manaCost: 8, range: 5, targetType: "enemy", baseDamage: 12, damageType: "physical", damageScaling: '{"attack": 0.8}', buffsApplied: ["Armadura Arcana"], rankRequired: 1, sortOrder: 2 },
      { name: "Postura Defensiva", description: "Ergue uma barreira arcana que aumenta sua defesa.", type: "active", subType: "buff", cooldown: 10000, manaCost: 10, range: 0, targetType: "self", baseDamage: 0, damageType: "physical", buffsApplied: ["Armadura Arcana"], rankRequired: 3, sortOrder: 3 },
      { name: "Grito de Guerra", description: "Berro de batalha que aumenta seu ataque.", type: "active", subType: "buff", cooldown: 15000, manaCost: 12, range: 0, targetType: "self", baseDamage: 0, damageType: "physical", buffsApplied: ["Fúria do Guerreiro"], rankRequired: 5, sortOrder: 4 },
      { name: "Juízo Final", description: "Um golpe devastador que abala a terra.", type: "ultimate", subType: "melee", cooldown: 30000, manaCost: 25, range: 5, targetType: "enemy", baseDamage: 40, damageType: "physical", damageScaling: '{"attack": 1.5}', rankRequired: 8, sortOrder: 5 },
    ],
    passives: [
      { name: "Bastião", description: "Vida máxima +10% e defesa +5.", rankRequired: 1, statModifiers: '{"maxHpPercent": 10, "defense": 5}', effectType: "stat" },
      { name: "Muralha de Ferro", description: "Defesa +8 e resistência mágica +5.", rankRequired: 4, statModifiers: '{"defense": 8, "magicDefense": 5}', effectType: "stat" },
      { name: "Espírito Inabalável", description: "Vida máxima +8% e recupera 1% da vida por rodada.", rankRequired: 7, statModifiers: '{"maxHpPercent": 8, "regenPercent": 1}', effectType: "stat" },
    ],
  },
  {
    class: "mago",
    skills: [
      { name: "Rajada Arcana", description: "Dispara um projétil de mana. Usado automaticamente.", type: "auto", subType: "spell", cooldown: 2000, manaCost: 0, range: 8, targetType: "enemy", baseDamage: 10, damageType: "magic", damageScaling: '{"magic": 0.9}', rankRequired: 1, sortOrder: 1 },
      { name: "Bola de Fogo", description: "Lança uma esfera de fogo que causa dano mágico e queima o alvo.", type: "active", subType: "spell", cooldown: 4000, manaCost: 15, range: 8, targetType: "enemy", baseDamage: 18, damageType: "magic", damageScaling: '{"magic": 1.2}', buffsApplied: ["Chama Arcana"], rankRequired: 1, sortOrder: 2 },
      { name: "Foco Arcano", description: "Concentra energia arcana, aumentando a recuperação de mana.", type: "active", subType: "buff", cooldown: 12000, manaCost: 10, range: 0, targetType: "self", baseDamage: 0, damageType: "magic", buffsApplied: ["Foco Arcano"], rankRequired: 3, sortOrder: 3 },
      { name: "Raio Arcano", description: "Um raio de energia pura que queima o alvo.", type: "active", subType: "spell", cooldown: 9000, manaCost: 20, range: 9, targetType: "enemy", baseDamage: 24, damageType: "magic", damageScaling: '{"magic": 1.5}', buffsApplied: ["Chama Arcana"], rankRequired: 5, sortOrder: 4 },
      { name: "Meteoro", description: "Invoca um meteoro que esmaga os inimigos.", type: "ultimate", subType: "aoe", cooldown: 30000, manaCost: 30, range: 10, targetType: "area", baseDamage: 50, damageType: "magic", damageScaling: '{"magic": 1.8}', rankRequired: 8, sortOrder: 5 },
    ],
    passives: [
      { name: "Chama Interior", description: "Poder mágico +8.", rankRequired: 1, statModifiers: '{"magic": 8}', effectType: "stat" },
      { name: "Fluxo Arcano", description: "Recuperação de mana +5 e poder mágico +4.", rankRequired: 4, statModifiers: '{"manaRecovery": 5, "magic": 4}', effectType: "stat" },
      { name: "Dominância Elemental", description: "Dano mágico +12% e redução de custo de mana 10%.", rankRequired: 7, statModifiers: '{"magicDamagePercent": 12, "manaCostReduction": 10}', effectType: "stat" },
    ],
  },
  {
    class: "assassino",
    skills: [
      { name: "Corte Rápido", description: "Um corte veloz com as lâminas. Usado automaticamente.", type: "auto", subType: "melee", cooldown: 2000, manaCost: 0, range: 5, targetType: "enemy", baseDamage: 9, damageType: "physical", damageScaling: '{"attack": 1.0}', rankRequired: 1, sortOrder: 1 },
      { name: "Golpe Sombrio", description: "Um ataque rápido vindo das sombras que causa sangramento.", type: "active", subType: "melee", cooldown: 3500, manaCost: 10, range: 5, targetType: "enemy", baseDamage: 14, damageType: "physical", damageScaling: '{"attack": 1.1}', buffsApplied: ["Sangramento"], rankRequired: 1, sortOrder: 2 },
      { name: "Passo Sombrio", description: "Desliza entre as sombras, aumentando sua esquiva.", type: "active", subType: "buff", cooldown: 12000, manaCost: 8, range: 0, targetType: "self", baseDamage: 0, damageType: "physical", buffsApplied: ["Passo das Sombras"], rankRequired: 3, sortOrder: 3 },
      { name: "Lâmina Envenenada", description: "Envenena as lâminas e fere o alvo com veneno corrosivo.", type: "active", subType: "melee", cooldown: 8000, manaCost: 14, range: 5, targetType: "enemy", baseDamage: 18, damageType: "physical", damageScaling: '{"attack": 1.3}', buffsApplied: ["Veneno Corrosivo"], rankRequired: 5, sortOrder: 4 },
      { name: "Execução", description: "Um golpe mortal que termina inimigos feridos.", type: "ultimate", subType: "melee", cooldown: 25000, manaCost: 20, range: 5, targetType: "enemy", baseDamage: 45, damageType: "physical", damageScaling: '{"attack": 1.6}', rankRequired: 8, sortOrder: 5 },
    ],
    passives: [
      { name: "Sangue Frio", description: "Chance de crítico +5%.", rankRequired: 1, statModifiers: '{"critChance": 5}', effectType: "stat" },
      { name: "Sombra da Morte", description: "Dano crítico +15% e chance de crítico +3%.", rankRequired: 4, statModifiers: '{"critDamage": 15, "critChance": 3}', effectType: "stat" },
      { name: "Veneno Lento", description: "Dano dos seus efeitos de dano contínuo +20%.", rankRequired: 7, statModifiers: '{"dotDamagePercent": 20}', effectType: "stat" },
    ],
  },
  {
    class: "suporte",
    skills: [
      { name: "Luz Sagrada", description: "Dispara um feixe de luz que fere o inimigo. Usado automaticamente.", type: "auto", subType: "spell", cooldown: 2000, manaCost: 0, range: 8, targetType: "enemy", baseDamage: 7, damageType: "magic", damageScaling: '{"magic": 0.7}', rankRequired: 1, sortOrder: 1 },
      { name: "Toque Curativo", description: "Cura o aliado alvo com luz divina.", type: "active", subType: "heal", cooldown: 4000, manaCost: 12, range: 8, targetType: "ally", baseDamage: 0, healingBase: 25, damageType: "magic", damageScaling: '{"magic": 0.9}', rankRequired: 1, sortOrder: 2 },
      { name: "Palavra de Poder", description: "Encanta um aliado, aumentando seu ataque.", type: "active", subType: "buff", cooldown: 10000, manaCost: 10, range: 8, targetType: "ally", baseDamage: 0, damageType: "magic", buffsApplied: ["Fúria do Guerreiro"], rankRequired: 3, sortOrder: 3 },
      { name: "Bênção da Luz", description: "Abençoa o aliado, regenerando vida ao longo do tempo.", type: "active", subType: "hot", cooldown: 15000, manaCost: 15, range: 8, targetType: "ally", baseDamage: 0, damageType: "magic", buffsApplied: ["Bênção da Luz"], rankRequired: 5, sortOrder: 4 },
      { name: "Milagre", description: "Uma cura massiva que restaura grande parte da vida.", type: "ultimate", subType: "heal", cooldown: 30000, manaCost: 30, range: 10, targetType: "area", baseDamage: 0, healingBase: 80, damageType: "magic", damageScaling: '{"magic": 1.5}', rankRequired: 8, sortOrder: 5 },
    ],
    passives: [
      { name: "Piedade", description: "Poder de cura +10%.", rankRequired: 1, statModifiers: '{"healingPowerPercent": 10}', effectType: "stat" },
      { name: "Graça Divina", description: "Recuperação de mana +4 e poder de cura +8%.", rankRequired: 4, statModifiers: '{"manaRecovery": 4, "healingPowerPercent": 8}', effectType: "stat" },
      { name: "Sacrifício", description: "Suas curas podem exceder a vida máxima em até 10%.", rankRequired: 7, statModifiers: '{"overhealPercent": 10}', effectType: "stat" },
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

async function upsertItem(item) {
  const existing = await prisma.item.findFirst({ where: { name: item.name } });
  if (existing) return prisma.item.update({ where: { id: existing.id }, data: { ...item } });
  return prisma.item.create({ data: { ...item } });
}

async function upsertMonster(monster) {
  const existing = await prisma.monster.findFirst({ where: { name: monster.name } });
  if (existing) return prisma.monster.update({ where: { id: existing.id }, data: { ...monster } });
  return prisma.monster.create({ data: { ...monster } });
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

async function upsertBuff(buff) {
  const existing = await prisma.buff.findFirst({ where: { name: buff.name } });
  if (existing) return prisma.buff.update({ where: { id: existing.id }, data: { ...buff } });
  return prisma.buff.create({ data: { ...buff } });
}

async function upsertQuest(quest, giverNpcId, mapId) {
  const existing = await prisma.quest.findFirst({ where: { title: quest.title } });
  const data = {
    title: quest.title,
    description: quest.description,
    type: quest.type,
    difficulty: quest.difficulty,
    requiredLevel: quest.requiredLevel,
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
    description: skill.description,
    type: skill.type,
    subType: skill.subType,
    cooldown: skill.cooldown,
    manaCost: skill.manaCost,
    castTime: 0,
    range: skill.range,
    targetType: skill.targetType,
    rankRequired: skill.rankRequired || 1,
    sortOrder: skill.sortOrder,
    isActive: true,
    baseDamage: skill.baseDamage,
    damageType: skill.damageType,
    damageScaling: skill.damageScaling,
    healingBase: skill.healingBase || 0,
    buffsApplied: skill.buffsApplied,
  };
  if (existing) return prisma.skill.update({ where: { id: existing.id }, data });
  return prisma.skill.create({ data: { ...data, classId } });
}

async function upsertPassive(classId, passive) {
  const existing = await prisma.classPassive.findFirst({ where: { classId, name: passive.name } });
  const data = {
    name: passive.name,
    description: passive.description,
    rankRequired: passive.rankRequired,
    statModifiers: passive.statModifiers,
    effectType: passive.effectType,
  };
  if (existing) return prisma.classPassive.update({ where: { id: existing.id }, data });
  return prisma.classPassive.create({ data: { ...data, classId } });
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
    "floresta-sombria": ["Rato da Floresta", "Slime Verde", "Lobo Cinzento", "Goblin Saqueador"],
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
  for (const quest of quests) {
    const created = await upsertQuest(quest, npcMap[quest.giverNpc]?.id ?? null, mapMap[quest.map]?.id ?? null);
    console.log("  quest:", created.title);
  }

  console.log("Seeding buffs...");
  const buffMap = {};
  for (const buff of buffs) {
    const created = await upsertBuff(buff);
    buffMap[buff.name] = created;
    console.log("  buff:", buff.name);
  }

  console.log("Seeding skills & passives...");
  for (const entry of classSkills) {
    const cls = await prisma.gameClass.findUnique({ where: { slug: entry.class } });
    if (!cls) {
      console.log("  SKIP class not found:", entry.class);
      continue;
    }
    for (const skill of entry.skills) {
      if (skill.buffsApplied) {
        skill.buffsApplied = JSON.stringify(
          skill.buffsApplied.map((name) => buffMap[name].id)
        );
      }
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
}

async function main() {
  console.log("Seeding starter classes...");
  for (const cls of starterClasses) {
    await prisma.gameClass.upsert({
      where: { slug: cls.slug },
      update: { ...cls },
      create: { ...cls, isActive: true, isStarter: true },
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

