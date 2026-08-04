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
  // ===== Weapons (STR/INT) =====
  { name: "Espada de Iniciante", description: "Uma espada simples forjada para novos aventureiros.", type: "weapon", rarity: "common", level: 1, rank: 1, buyPrice: 50, sellPrice: 10, strength: 4, dexterity: 1, icon: "/icons/64x64/Armas/fc1441.png" },
  { name: "Adaga de Iniciante", description: "Leve e afiada, ideal para golpes precisos.", type: "weapon", rarity: "common", level: 1, rank: 1, buyPrice: 50, sellPrice: 10, strength: 2, dexterity: 3, icon: "/icons/64x64/Armas/fc1442.png" },
  { name: "Cajado do Aprendiz", description: "Canaliza os primeiros feitiços de um mago.", type: "weapon", rarity: "common", level: 1, rank: 1, buyPrice: 50, sellPrice: 10, intellect: 5, icon: "/icons/64x64/Armas/fc1443.png" },
  { name: "Cajado da Luz", description: "Um cajado abençoado que fortalece as curas.", type: "weapon", rarity: "common", level: 1, rank: 1, buyPrice: 50, sellPrice: 10, intellect: 4, wisdom: 1, icon: "/icons/64x64/Armas/fc1444.png" },
  { name: "Espada de Ferro", description: "Uma espada de ferro confiável para aventureiros iniciantes.", type: "weapon", rarity: "uncommon", level: 3, rank: 2, buyPrice: 150, sellPrice: 30, strength: 8, dexterity: 2, icon: "/icons/64x64/Armas/fc1445.png" },
  { name: "Adaga Serrilhada", description: "Lâmina serrilhada que causa ferimentos graves.", type: "weapon", rarity: "uncommon", level: 3, rank: 2, buyPrice: 140, sellPrice: 28, strength: 4, dexterity: 6, icon: "/icons/64x64/Armas/fc1446.png" },
  { name: "Cajado Arcano", description: "Canaliza poder arcano com precisão.", type: "weapon", rarity: "uncommon", level: 3, rank: 2, buyPrice: 160, sellPrice: 32, intellect: 10, wisdom: 2, icon: "/icons/64x64/Armas/fc1447.png" },
  { name: "Machado de Batalha", description: "Uma lâmina pesada que parte escudos.", type: "weapon", rarity: "rare", level: 6, rank: 3, buyPrice: 400, sellPrice: 80, strength: 18, endurance: 3, icon: "/icons/64x64/Armas/fc1448.png" },
  { name: "Grimório Antigo", description: "Um tomo arcano repleto de feitiços esquecidos.", type: "weapon", rarity: "rare", level: 6, rank: 3, buyPrice: 420, sellPrice: 84, intellect: 16, wisdom: 5, icon: "/icons/64x64/Armas/fc1449.png" },
  // ===== Helms (END/WIS) =====
  { name: "Capuz de Pano", description: "Proteção simples para a cabeça.", type: "helm", rarity: "common", level: 1, rank: 1, buyPrice: 30, sellPrice: 6, endurance: 2, wisdom: 1, icon: "/icons/64x64/Elmo/fc1832.png" },
  { name: "Elmo de Ferro", description: "Elmo resistente dos soldados da vila.", type: "helm", rarity: "uncommon", level: 3, rank: 2, buyPrice: 110, sellPrice: 22, endurance: 6, wisdom: 2, icon: "/icons/64x64/Elmo/fc1838.png" },
  { name: "Coroa Arcano", description: "Coroa encantada que amplifica o conhecimento.", type: "helm", rarity: "rare", level: 6, rank: 3, buyPrice: 360, sellPrice: 72, wisdom: 10, intellect: 5, icon: "/icons/64x64/Elmo/fc1839.png" },
  // ===== Armors (END/DEX) =====
  { name: "Túnica Simples", description: "Roupas leves e confortáveis.", type: "armor", rarity: "common", level: 1, rank: 1, buyPrice: 40, sellPrice: 8, endurance: 3, icon: "/icons/64x64/Robes/fc1969.png" },
  { name: "Armadura de Couro", description: "Proteção leve e resistente.", type: "armor", rarity: "uncommon", level: 2, rank: 2, buyPrice: 120, sellPrice: 24, endurance: 8, dexterity: 2, icon: "/icons/64x64/Armaduras/fc1827.png" },
  { name: "Cota de Malha", description: "Anéis de aço entrelaçados para máxima defesa.", type: "armor", rarity: "rare", level: 6, rank: 3, buyPrice: 380, sellPrice: 76, endurance: 14, strength: 4, icon: "/icons/64x64/Armaduras/fc1828.png" },
  // ===== Capes (WIS/LUK) =====
  { name: "Capa Esfarrapada", description: "Uma capa velha que esconde bem seu dono.", type: "cape", rarity: "common", level: 1, rank: 1, buyPrice: 35, sellPrice: 7, wisdom: 2, luck: 1, icon: "/icons/64x64/Capas/fc1823.png" },
  { name: "Manto de Veludo", description: "Um manto elegante dos nobres da vila.", type: "cape", rarity: "uncommon", level: 3, rank: 2, buyPrice: 130, sellPrice: 26, wisdom: 6, luck: 3, icon: "/icons/64x64/Capas/fc1824.png" },
  { name: "Capa do Vento", description: "Flutua como o vento e melhora os reflexos.", type: "cape", rarity: "rare", level: 6, rank: 3, buyPrice: 340, sellPrice: 68, dexterity: 8, luck: 4, icon: "/icons/64x64/Capas/fc1825.png" },
  // ===== Rings (LUK/STR ou INT) =====
  { name: "Anel de Bronze", description: "Um anel simples, dizem que traz sorte.", type: "ring", rarity: "common", level: 1, rank: 1, buyPrice: 45, sellPrice: 9, luck: 2, strength: 1, icon: "/icons/64x64/Aneis/fc1843.png" },
  { name: "Anel de Prata", description: "Anel prateado de um artesão habilidoso.", type: "ring", rarity: "uncommon", level: 3, rank: 2, buyPrice: 145, sellPrice: 29, luck: 5, strength: 3, icon: "/icons/64x64/Aneis/fc1844.png" },
  { name: "Anel do Fogo", description: "Pulsa com energia ardente.", type: "ring", rarity: "rare", level: 6, rank: 3, buyPrice: 390, sellPrice: 78, intellect: 7, luck: 5, icon: "/icons/64x64/Aneis/fc1845.png" },
  // ===== Necklaces (WIS/LUK) =====
  { name: "Colar de Contas", description: "Contas de madeira entalhadas à mão.", type: "necklace", rarity: "common", level: 1, rank: 1, buyPrice: 40, sellPrice: 8, wisdom: 2, luck: 1, icon: "/icons/64x64/Colares/fc1849.png" },
  { name: "Amuleto da Sorte", description: "Um amuleto que afasta o azar.", type: "necklace", rarity: "uncommon", level: 3, rank: 2, buyPrice: 140, sellPrice: 28, luck: 5, wisdom: 3, icon: "/icons/64x64/Colares/fc1850.png" },
  { name: "Colar Arcano", description: "Um colar banhado em energia mística.", type: "necklace", rarity: "rare", level: 6, rank: 3, buyPrice: 370, sellPrice: 74, wisdom: 8, intellect: 4, icon: "/icons/64x64/Colares/fc1851.png" },
  // ===== Consumables =====
  { name: "Poção de Vida", description: "Restaura 50 de vida.", type: "consumable", rarity: "common", level: 1, isStackable: true, maxStack: 99, buyPrice: 20, sellPrice: 4, effects: '{"heal": 50}', icon: "/icons/64x64/Potion/Vida.png" },
  { name: "Poção de Mana", description: "Restaura 40 de mana.", type: "consumable", rarity: "common", level: 1, isStackable: true, maxStack: 99, buyPrice: 25, sellPrice: 5, effects: '{"manaRestore": 40}', icon: "/icons/64x64/Potion/Mana.png" },
];

// ===== Encantamentos (independentes dos itens, comprados na loja) =====
const enchantments = [
  { name: "Titã", slug: "titan", description: "Fortalece o corpo do portador, aumentando a força.", category: "physical", rarity: "common", minRank: 1, price: 5000, compatibleSlots: '["weapon","armor","ring","necklace"]', strength: 15 },
  { name: "Mago", slug: "mage", description: "Amplifica o poder arcano do portador.", category: "magical", rarity: "common", minRank: 1, price: 5000, compatibleSlots: '["weapon","cape","ring","necklace"]', intellect: 15 },
  { name: "Guardião", slug: "guardian", description: "Fortalece o corpo para resistir a golpes.", category: "defensive", rarity: "common", minRank: 1, price: 4500, compatibleSlots: '["helm","armor","necklace"]', endurance: 12 },
  { name: "Caçador", slug: "hunter", description: "Aguça os reflexos do portador.", category: "utility", rarity: "common", minRank: 1, price: 4000, compatibleSlots: '["weapon","helm","cape","ring"]', dexterity: 10 },
  { name: "Sábio", slug: "sage", description: "Expande a sabedoria e o equilíbrio do portador.", category: "magical", rarity: "common", minRank: 1, price: 4500, compatibleSlots: '["helm","cape","necklace"]', wisdom: 12 },
  { name: "Fortuna", slug: "fortune", description: "Atrai a sorte para o portador.", category: "utility", rarity: "common", minRank: 1, price: 3500, compatibleSlots: '["ring","cape","necklace"]', luck: 8 },
  { name: "Ventania", slug: "swift", description: "Movimento mais ágil e golpes mais precisos.", category: "utility", rarity: "uncommon", minRank: 2, price: 6000, compatibleSlots: '["weapon","cape","ring"]', dexterity: 6, luck: 2 },
  { name: "Colosso", slug: "colossus", description: "Uma força descomunal para os mais fortes.", category: "physical", rarity: "rare", minRank: 3, price: 12000, compatibleSlots: '["weapon","armor"]', strength: 30 },
];

const monsters = [
  { name: "Dummy de Treino", description: "Um boneco de madeira usado para treinar golpes na vila. Não revida.", level: 1, hp: 300, mana: 0, attack: 0, defense: 5, magic: 0, magicDefense: 5, speed: 1, xpReward: 0, goldReward: 0, attackSpeed: 99999 },
  { name: "Rato da Floresta", description: "Um roedor feroz que invade acampamentos.", level: 1, hp: 30, mana: 0, attack: 6, defense: 2, magic: 0, magicDefense: 2, speed: 10, xpReward: 20, goldReward: 8, attackSpeed: 2000, drops: [{ item: "Poção de Vida", chance: 30, min: 1, max: 2 }, { item: "Anel de Bronze", chance: 45, min: 1, max: 2 }] },
  { name: "Slime Verde", description: "Gosma gelatinosa comum nas florestas.", level: 1, hp: 25, mana: 0, attack: 5, defense: 3, magic: 0, magicDefense: 2, speed: 5, xpReward: 15, goldReward: 5, attackSpeed: 2500, drops: [{ item: "Poção de Mana", chance: 25, min: 1, max: 1 }, { item: "Capa Esfarrapada", chance: 40, min: 1, max: 2 }] },
  { name: "Lobo Cinzento", description: "Um predador veloz que caça em matilha.", level: 2, hp: 45, mana: 0, attack: 9, defense: 4, magic: 0, magicDefense: 3, speed: 14, xpReward: 35, goldReward: 15, attackSpeed: 1800, skills: JSON.stringify([{ name: "Mordida Feroz", slug: "mordida-feroz", description: "Uma mordida poderosa que causa dano extra.", kind: "attack", trigger: "active", target: "enemy", cooldown: 5000, manaCost: 0, rankRequired: 1, actions: [{ action: "damage", amount: 12, scaling: [{ stat: "attack", factor: 1.2 }], damageType: "physical" }] }]), drops: [{ item: "Poção de Vida", chance: 40, min: 1, max: 2 }, { item: "Espada de Ferro", chance: 8, min: 1, max: 1 }, { item: "Colar de Contas", chance: 35, min: 1, max: 1 }] },
  { name: "Goblin Saqueador", description: "Pequeno, covarde e perigoso com sua adaga.", level: 3, hp: 60, mana: 10, attack: 12, defense: 5, magic: 2, magicDefense: 3, speed: 12, xpReward: 60, goldReward: 25, attackSpeed: 1600, skills: JSON.stringify([{ name: "Adaga Envenenada", slug: "adaga-envenenada", description: "Ataca com uma adaga coberta de veneno corrosivo.", kind: "attack", trigger: "active", target: "enemy", cooldown: 6000, manaCost: 5, rankRequired: 1, actions: [{ action: "damage", amount: 10, scaling: [{ stat: "attack", factor: 1 }], damageType: "physical" }, { action: "applyEffect", effect: "veneno-corrosivo", target: "enemy", stacks: 1 }] }]), drops: [{ item: "Poção de Vida", chance: 30, min: 1, max: 1 }, { item: "Adaga Serrilhada", chance: 10, min: 1, max: 1 }, { item: "Anel de Prata", chance: 20, min: 1, max: 1 }] },
  { name: "Goblin Bruxo", description: "O chefe goblin que comanda a floresta com magia negra. Derrotá-lo concede recompensas em dobro.", level: 4, hp: 130, mana: 30, attack: 16, defense: 7, magic: 9, magicDefense: 6, speed: 10, xpReward: 200, goldReward: 80, attackSpeed: 1500, isBoss: true, skills: JSON.stringify([
    { name: "Bola de Fogo", slug: "bola-de-fogo-goblin", description: "Lança uma esfera de fogo que queima o alvo.", kind: "attack", trigger: "active", target: "enemy", cooldown: 6000, manaCost: 10, rankRequired: 1, actions: [{ action: "damage", amount: 14, scaling: [{ stat: "magic", factor: 1.1 }], damageType: "magic" }, { action: "applyEffect", effect: "chama-arcana", target: "enemy", stacks: 1 }] },
    { name: "Fúria Goblin", slug: "furia-goblin", description: "O goblin entra em fúria, aumentando seu ataque.", kind: "buff", trigger: "active", target: "self", cooldown: 12000, manaCost: 10, rankRequired: 1, actions: [{ action: "applyEffect", effect: "furia-do-guerreiro", target: "self", stacks: 1 }] },
  ]), drops: [{ item: "Cajado Arcano", chance: 25, min: 1, max: 1 }, { item: "Poção de Vida", chance: 50, min: 2, max: 3 }, { item: "Manto de Veludo", chance: 40, min: 1, max: 2 }] },
  { name: "Golem de Pedra", description: "Uma criatura colossal de rocha que guarda a entrada da Caverna do Dragão. Sua pele é quase impenetrável.", level: 8, hp: 400, mana: 20, attack: 28, defense: 18, magic: 4, magicDefense: 12, speed: 6, xpReward: 800, goldReward: 300, attackSpeed: 2000, isElite: true, skills: JSON.stringify([
    { name: "Esmagamento", slug: "esmagamento", description: "O golem ergue os punhos e esmaga o chão, causando grande dano físico.", kind: "attack", trigger: "active", target: "enemy", cooldown: 7000, manaCost: 0, rankRequired: 1, actions: [{ action: "damage", amount: 30, scaling: [{ stat: "attack", factor: 1.3 }], damageType: "physical" }] },
    { name: "Pele de Rocha", slug: "pele-de-rocha", description: "O golem endurece a pele, aumentando sua defesa.", kind: "buff", trigger: "active", target: "self", cooldown: 15000, manaCost: 0, rankRequired: 1, actions: [{ action: "applyEffect", effect: "armadura-arcana", target: "self", stacks: 2 }] },
  ]), drops: [{ item: "Cota de Malha", chance: 20, min: 1, max: 1 }, { item: "Poção de Vida", chance: 60, min: 2, max: 4 }, { item: "Anel de Prata", chance: 100, min: 2, max: 4, guaranteed: true }, { item: "Manto de Veludo", chance: 100, min: 1, max: 2, guaranteed: true }] },
  { name: "Dragão Sombrio", description: "O temido Dragão Sombrio, senhor da Caverna do Dragão. Derrotá-lo é a maior honra de um aventureiro.", level: 12, hp: 1500, mana: 100, attack: 45, defense: 25, magic: 30, magicDefense: 22, speed: 12, xpReward: 5000, goldReward: 2000, attackSpeed: 1400, isBoss: true, skills: JSON.stringify([
    { name: "Sopro de Fogo", slug: "sopro-de-fogo", description: "O dragão cospe fogo, causando dano mágico massivo e queimando o alvo.", kind: "attack", trigger: "active", target: "enemy", cooldown: 8000, manaCost: 20, rankRequired: 1, actions: [{ action: "damage", amount: 40, scaling: [{ stat: "magic", factor: 1.2 }], damageType: "magic" }, { action: "applyEffect", effect: "chama-arcana", target: "enemy", stacks: 2 }] },
    { name: "Garra Sombria", slug: "garra-sombria", description: "Um corte com garras afiadas que faz o alvo sangrar.", kind: "attack", trigger: "active", target: "enemy", cooldown: 5000, manaCost: 10, rankRequired: 1, actions: [{ action: "damage", amount: 30, scaling: [{ stat: "attack", factor: 1.2 }], damageType: "physical" }, { action: "applyEffect", effect: "sangramento", target: "enemy", stacks: 2 }] },
    { name: "Escamas de Ferro", slug: "escamas-de-ferro", description: "O dragão endurece as escamas, aumentando muito sua defesa.", kind: "buff", trigger: "active", target: "self", cooldown: 18000, manaCost: 15, rankRequired: 1, actions: [{ action: "applyEffect", effect: "armadura-arcana", target: "self", stacks: 3 }] },
    { name: "Fúria do Dragão", slug: "furia-do-dragao", description: "O dragão se enfurece, aumentando seu ataque.", kind: "buff", trigger: "active", target: "self", cooldown: 25000, manaCost: 20, rankRequired: 1, actions: [{ action: "applyEffect", effect: "furia-do-guerreiro", target: "self", stacks: 3 }] },
  ]), drops: [{ item: "Machado de Batalha", chance: 30, min: 1, max: 1 }, { item: "Cajado Arcano", chance: 30, min: 1, max: 1 }, { item: "Poção de Vida", chance: 100, min: 3, max: 5 }, { item: "Anel de Prata", chance: 100, min: 5, max: 8, guaranteed: true }, { item: "Manto de Veludo", chance: 100, min: 4, max: 6, guaranteed: true }, { item: "Colar de Contas", chance: 100, min: 3, max: 5, guaranteed: true }] },
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
  {
    name: "Caverna do Dragão",
    slug: "caverna-do-dragao",
    description: "Uma masmorra letal guardada por um Golem de Pedra e dominada pelo Dragão Sombrio. Raid com tentativas limitadas que resetam periodicamente — derrote o boss para ganhar recompensas épicas!",
    region: "Reino de Arcádia",
    requiredLevel: 8,
    type: "raid",
    raidResetHours: 24,
    maxRaidAttempts: 3,
    sortOrder: 3,
  },
];

const npcs = [
  { name: "Aurelia", description: "Vendedora de poções e equipamentos da vila.", type: "vendor", dialogue: "Bem-vindo à minha loja, aventureiro!" },
  { name: "Mestre Branko", description: "Um velho veterano que dá missões aos novatos.", type: "quest_giver", dialogue: "Precisa de trabalho? Tenho algumas tarefas para você." },
];

const shopOffers = [
  { npc: "Aurelia", item: "Poção de Vida", price: 20 },
  { npc: "Aurelia", item: "Poção de Mana", price: 25 },
  { npc: "Aurelia", item: "Espada de Ferro", price: 150, class: "cavaleiro" },
  { npc: "Aurelia", item: "Adaga Serrilhada", price: 140, class: "assassino" },
  { npc: "Aurelia", item: "Cajado Arcano", price: 160, class: "mago" },
  { npc: "Aurelia", item: "Armadura de Couro", price: 120, requiredLevel: 3 },
  { npc: "Aurelia", enchantment: "titan", price: 5000 },
  { npc: "Aurelia", enchantment: "mage", price: 5000 },
  { npc: "Aurelia", enchantment: "guardian", price: 4500 },
  { npc: "Aurelia", enchantment: "hunter", price: 4000 },
  { npc: "Aurelia", enchantment: "sage", price: 4500 },
  { npc: "Aurelia", enchantment: "fortune", price: 3500 },
  { npc: "Aurelia", enchantment: "swift", price: 6000 },
  { npc: "Aurelia", enchantment: "colossus", price: 12000 },
  { npc: "Aurelia", item: "Anel de Bronze", price: 10 },
  { npc: "Aurelia", item: "Anel de Prata", price: 35 },
  { npc: "Aurelia", item: "Capa Esfarrapada", price: 15 },
  { npc: "Aurelia", item: "Manto de Veludo", price: 45 },
  { npc: "Aurelia", item: "Colar de Contas", price: 25 },
];

const craftRecipes = [
  {
    name: "Espada de Ferro Reforçada",
    description: "Tempere sua espada com ferro bruto.",
    resultItem: "Espada de Ferro",
    resultQuantity: 1,
    requiredLevel: 2,
    ingredients: [{ itemName: "Anel de Bronze", quantity: 2 }],
  },
  {
    name: "Poção de Vida Reforçada",
    description: "Misture ervas e água pura para criar poções.",
    resultItem: "Poção de Vida",
    resultQuantity: 3,
    requiredLevel: 1,
    ingredients: [{ itemName: "Capa Esfarrapada", quantity: 1 }],
  },
  {
    name: "Poção de Mana Reforçada",
    description: "Destile mana bruta em poções de mana.",
    resultItem: "Poção de Mana",
    resultQuantity: 3,
    requiredLevel: 1,
    ingredients: [{ itemName: "Colar de Contas", quantity: 1 }],
  },
  {
    name: "Cajado Arcano Aprimorado",
    description: "Envolva o cajado em prata pura.",
    resultItem: "Cajado Arcano",
    resultQuantity: 1,
    requiredLevel: 3,
    ingredients: [{ itemName: "Anel de Prata", quantity: 3 }],
  },
  {
    name: "Armadura de Couro Reforçada",
    description: "Costure couro resistente na armadura.",
    resultItem: "Armadura de Couro",
    resultQuantity: 1,
    requiredLevel: 3,
    ingredients: [{ itemName: "Manto de Veludo", quantity: 2 }],
  },
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

async function upsertEnchantment(enchantment) {
  const existing = await prisma.enchantment.findFirst({
    where: { OR: [{ slug: enchantment.slug }, { name: enchantment.name }] },
  });
  if (existing) return prisma.enchantment.update({ where: { id: existing.id }, data: { ...enchantment } });
  return prisma.enchantment.create({ data: { ...enchantment } });
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
          isGuaranteed: drop.guaranteed || false,
          ...(drop.minLevel !== undefined ? { minLevel: drop.minLevel } : {}),
          ...(drop.maxLevel !== undefined ? { maxLevel: drop.maxLevel } : {}),
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
    arcadia: ["Dummy de Treino"],
    "caverna-do-dragao": ["Golem de Pedra", "Dragão Sombrio"],
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
  // Arcádia: remove monstros que não sejam o Dummy de Treino
  {
    const dummy = monsterMap["Dummy de Treino"];
    const arcadiaMonsters = await prisma.mapMonster.findMany({
      where: { mapId: mapMap.arcadia.id },
      select: { id: true, monsterId: true },
    });
    for (const mm of arcadiaMonsters) {
      if (mm.monsterId !== dummy.id) {
        await prisma.mapMonster.delete({ where: { id: mm.id } });
        console.log("  mapMonster removed: arcadia ->", mm.monsterId);
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
    if (!npc) continue;
    const cls = offer.class ? await prisma.gameClass.findUnique({ where: { slug: offer.class } }) : null;
    let item = null;
    let enchantment = null;
    if (offer.item) {
      item = itemMap[offer.item];
      if (!item) continue;
    }
    if (offer.enchantment) {
      enchantment = await prisma.enchantment.findUnique({ where: { slug: offer.enchantment } });
      if (!enchantment) continue;
    }
    const where = offer.item
      ? { npcId: npc.id, itemId: item.id, enchantmentId: null }
      : { npcId: npc.id, itemId: null, enchantmentId: enchantment.id };
    const data = {
      npcId: npc.id,
      itemId: item?.id ?? null,
      enchantmentId: enchantment?.id ?? null,
      price: BigInt(offer.price),
      currency: "gold",
      classId: cls?.id ?? null,
      requiredLevel: offer.requiredLevel || 0,
    };
    const existing = await prisma.shopItem.findFirst({ where });
    if (existing) {
      await prisma.shopItem.update({ where: { id: existing.id }, data: { classId: data.classId, requiredLevel: data.requiredLevel } });
      console.log("  shop (updated):", offer.npc, "->", offer.item ?? offer.enchantment, cls ? `[${cls.name}]` : "");
    } else {
      await prisma.shopItem.create({ data });
      console.log("  shop:", offer.npc, "->", offer.item ?? offer.enchantment, cls ? `[${cls.name}]` : "");
    }
  }

  console.log("Seeding craft recipes...");
  for (const recipe of craftRecipes) {
    const resultItem = itemMap[recipe.resultItem];
    if (!resultItem) continue;
    const ingredients = JSON.stringify(recipe.ingredients || []);
    const existing = await prisma.craftRecipe.findFirst({ where: { name: recipe.name } });
    if (existing) {
      await prisma.craftRecipe.update({
        where: { id: existing.id },
        data: {
          description: recipe.description,
          resultItemId: resultItem.id,
          resultQuantity: recipe.resultQuantity,
          requiredLevel: recipe.requiredLevel,
          ingredients,
          isActive: true,
        },
      });
      console.log("  craft (updated):", recipe.name);
    } else {
      await prisma.craftRecipe.create({
        data: {
          name: recipe.name,
          description: recipe.description,
          resultItemId: resultItem.id,
          resultQuantity: recipe.resultQuantity,
          requiredLevel: recipe.requiredLevel,
          ingredients,
          isActive: true,
        },
      });
      console.log("  craft:", recipe.name);
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

  console.log("Seeding enchantments...");
  for (const enchantment of enchantments) {
    const created = await upsertEnchantment(enchantment);
    console.log("  enchantment:", created.slug);
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
  const removedEnchantments = await prisma.shopProduct.deleteMany({ where: { type: "enchantment" } });
  if (removedEnchantments.count > 0) console.log("  removed legacy enchantment products:", removedEnchantments.count);
  for (const product of shopProducts) {
    const { enchantmentSlug, ...productData } = product;
    const created = await prisma.shopProduct.upsert({
      where: { slug: product.slug },
      update: { ...productData },
      create: { ...productData },
    });
    if (enchantmentSlug) {
      const enchantment = await prisma.enchantment.findFirst({ where: { slug: enchantmentSlug } });
      if (enchantment) {
        await prisma.shopProduct.update({
          where: { id: created.id },
          data: { enchantmentId: enchantment.id },
        });
      }
    }
    console.log("  product:", created.slug);
  }

  console.log("Seeding patch notes...");
  await prisma.patchNote.upsert({
    where: { id: "patch-notes-v1" },
    update: {},
    create: {
      id: "patch-notes-v1",
      title: "Atualização 1.0 — Raids e Skills de Monstros",
      content:
        "Bem-vindo à Temporada 1!\n• Novo mapa de Raid: Caverna do Dragão (tentativas limitadas com reset diário)\n• Monstros agora usam skills especiais (sopro de fogo, veneno, fúria...)\n• Encantamentos à venda na loja da Aurelia (por ouro)\n• Sistema de classes reformulado",
      version: "1.0",
      isActive: true,
    },
  });
  console.log("  patch note: v1");

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

