// Seeds the new class system: StatModels, Effects catalog, Skills, Passives and links them to the existing GameClasses.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const STAT_MODELS = [
  {
    name: "Tanque", slug: "tank",
    description: "Alta vida e defesa. Protege aliados e aguenta golpes.",
    base: { hp: 140, mana: 60, attack: 14, defense: 16, magic: 4, magicDefense: 12, speed: 5 },
    perLevel: { hp: 28, mana: 6, attack: 2.2, defense: 2.6, magic: 0.6, magicDefense: 2, speed: 0.3 },
    scaling: { attackPowerPerAttack: 1, spellPowerPerMagic: 1, critChancePerSpeed: 0.5, critDamageBase: 150, dodgePerSpeed: 0.25, attackSpeedMs: 1600, manaRegenPerTick: 4, healthRegenPerTick: 2, threatPerAttack: 25, aggroPerHit: 30 },
  },
  {
    name: "Conjurador", slug: "caster",
    description: "Alto dano mágico à distância. Frágil, mas devastador.",
    base: { hp: 90, mana: 130, attack: 6, defense: 8, magic: 20, magicDefense: 12, speed: 6 },
    perLevel: { hp: 16, mana: 18, attack: 0.8, defense: 1, magic: 3.2, magicDefense: 1.8, speed: 0.3 },
    scaling: { attackPowerPerAttack: 1, spellPowerPerMagic: 1, critChancePerSpeed: 0.5, critDamageBase: 150, dodgePerSpeed: 0.25, attackSpeedMs: 1500, manaRegenPerTick: 12, healthRegenPerTick: 1, threatPerAttack: 10, aggroPerHit: 10 },
  },
  {
    name: "Dano Físico", slug: "dps",
    description: "Ataques rápidos e críticos frequentes. Sangra inimigos.",
    base: { hp: 110, mana: 70, attack: 20, defense: 10, magic: 6, magicDefense: 8, speed: 12 },
    perLevel: { hp: 20, mana: 7, attack: 3, defense: 1.4, magic: 0.8, magicDefense: 1.2, speed: 0.8 },
    scaling: { attackPowerPerAttack: 1, spellPowerPerMagic: 1, critChancePerSpeed: 1.2, critDamageBase: 180, dodgePerSpeed: 0.8, attackSpeedMs: 1200, manaRegenPerTick: 6, healthRegenPerTick: 2, threatPerAttack: 15, aggroPerHit: 10 },
  },
  {
    name: "Suporte", slug: "support",
    description: "Cura aliados e aplica buffs. Essencial em grupos.",
    base: { hp: 100, mana: 120, attack: 8, defense: 10, magic: 16, magicDefense: 12, speed: 6 },
    perLevel: { hp: 18, mana: 16, attack: 1, defense: 1.4, magic: 2.6, magicDefense: 1.8, speed: 0.3 },
    scaling: { attackPowerPerAttack: 1, spellPowerPerMagic: 1, critChancePerSpeed: 0.5, critDamageBase: 150, dodgePerSpeed: 0.25, attackSpeedMs: 1500, manaRegenPerTick: 10, healthRegenPerTick: 2, threatPerAttack: 10, aggroPerHit: 10 },
  },
  {
    name: "Equilibrado", slug: "hybrid",
    description: "Versátil, com dano físico e mágico balanceados.",
    base: { hp: 100, mana: 100, attack: 12, defense: 10, magic: 12, magicDefense: 10, speed: 7 },
    perLevel: { hp: 20, mana: 12, attack: 1.8, defense: 1.5, magic: 1.8, magicDefense: 1.5, speed: 0.4 },
    scaling: { attackPowerPerAttack: 1, spellPowerPerMagic: 1, critChancePerSpeed: 0.6, critDamageBase: 155, dodgePerSpeed: 0.3, attackSpeedMs: 1400, manaRegenPerTick: 8, healthRegenPerTick: 2, threatPerAttack: 12, aggroPerHit: 12 },
  },
];

const EFFECTS = [
  { name: "Fortificar", slug: "fortify", kind: "buff", category: "defense", description: "Aumenta defesa e defesa mágica.", icon: "🛡️", maxStacks: 3, duration: 20000, refreshBehavior: "stack", priority: 5, statModifiers: { flat: { defense: 8, magicDefense: 4 } } },
  { name: "Fúria", slug: "rage", kind: "buff", category: "offense", description: "Aumenta poder de ataque e poder mágico.", icon: "🔥", maxStacks: 5, duration: 15000, refreshBehavior: "stack", priority: 5, statModifiers: { flat: { attackPower: 6, spellPower: 6 } } },
  { name: "Fraqueza", slug: "weakness", kind: "debuff", category: "offense", description: "Reduz defesa e defesa mágica do inimigo.", icon: "💔", maxStacks: 3, duration: 12000, refreshBehavior: "stack", priority: 5, statModifiers: { flat: { defense: -8, magicDefense: -4 } } },
  { name: "Sangramento", slug: "bleed", kind: "dot", category: "offense", description: "Causa dano físico ao longo do tempo. Acumula.", icon: "🩸", maxStacks: 5, duration: 10000, refreshBehavior: "stack", priority: 5, tickInterval: 2000, tickDamage: { base: 8, scaling: [{ stat: "attackPower", factor: 0.2 }], damageType: "physical" } },
  { name: "Queimadura", slug: "burn", kind: "dot", category: "offense", description: "Causa dano mágico ao longo do tempo. Acumula.", icon: "🔥", maxStacks: 5, duration: 8000, refreshBehavior: "stack", priority: 5, tickInterval: 2000, tickDamage: { base: 10, scaling: [{ stat: "spellPower", factor: 0.25 }], damageType: "magic" } },
  { name: "Regeneração", slug: "regen", kind: "hot", category: "recovery", description: "Cura vida ao longo do tempo.", icon: "💚", maxStacks: 1, duration: 12000, refreshBehavior: "refresh", priority: 5, tickInterval: 2000, tickHealing: { base: 12, scaling: [{ stat: "spellPower", factor: 0.2 }] } },
  { name: "Lentidão", slug: "slow", kind: "debuff", category: "control", description: "Reduz a velocidade do inimigo.", icon: "❄️", maxStacks: 1, duration: 8000, refreshBehavior: "refresh", priority: 5, statModifiers: { flat: { speed: -4 } } },
];

// ==================== CAVALEIRO (tank) ====================
const CAVALEIRO = {
  skills: [
    { slug: "cav-golpe", name: "Golpe de Espada", icon: "🗡️", kind: "attack", trigger: "auto", target: "enemy", cooldown: 0, manaCost: 0, description: "Ataque básico com a espada.", actions: [{ action: "damage", amount: 12, scaling: [{ stat: "attackPower", factor: 0.8 }], damageType: "physical" }] },
    { slug: "cav-golpe-pesado", name: "Golpe Pesado", icon: "⚔️", kind: "attack", trigger: "active", target: "enemy", cooldown: 5000, manaCost: 15, rankRequired: 1, sortOrder: 1, description: "Golpe forte que também fortifica sua defesa.", actions: [{ action: "damage", amount: 20, scaling: [{ stat: "attackPower", factor: 1.1 }], damageType: "physical" }, { action: "applyEffect", effect: "fortify", stacks: 1, target: "self" }] },
    { slug: "cav-investida", name: "Investida", icon: "🏇", kind: "attack", trigger: "active", target: "enemy", cooldown: 9000, manaCost: 25, rankRequired: 3, sortOrder: 2, description: "Investida poderosa que causa grande dano.", actions: [{ action: "damage", amount: 35, scaling: [{ stat: "attackPower", factor: 1.5 }], damageType: "physical" }] },
    { slug: "cav-grito-guerra", name: "Grito de Guerra", icon: "📢", kind: "buff", trigger: "active", target: "self", cooldown: 20000, manaCost: 30, rankRequired: 5, sortOrder: 3, description: "Fortalece defesa e ataque por 15s.", actions: [{ action: "applyEffect", effect: "fortify", stacks: 2, target: "self" }, { action: "applyEffect", effect: "rage", stacks: 2, target: "self" }] },
    { slug: "cav-escudo-sagrado", name: "Escudo Sagrado", icon: "✨", kind: "defense", trigger: "active", target: "self", cooldown: 15000, manaCost: 20, rankRequired: 7, sortOrder: 4, description: "Cria uma barreira que fortalece sua defesa.", actions: [{ action: "applyEffect", effect: "fortify", stacks: 1, target: "self" }, { action: "heal", amount: 15, scaling: [{ stat: "maxHp", factor: 0 }], percentOfMax: 8 }] },
  ],
  passives: [
    { slug: "cav-pele-rocha", name: "Pele de Rocha", icon: "🪨", rankRequired: 1, sortOrder: 1, description: "+5 defesa e +3 defesa mágica.", statModifiers: { flat: { defense: 5, magicDefense: 3 } } },
    { slug: "cav-muralha", name: "Muralha Viva", icon: "🧱", rankRequired: 3, sortOrder: 2, description: "+10% defesa.", statModifiers: { percent: { defense: 10 } } },
    { slug: "cav-contra-ataque", name: "Contra-Ataque", icon: "↩️", rankRequired: 5, sortOrder: 3, description: "Sempre que acertar, causa dano bônus.", events: [{ event: "onHit", actions: [{ action: "damage", amount: 6, scaling: [{ stat: "attackPower", factor: 0.3 }], damageType: "physical" }] }] },
    { slug: "cav-ferocidade", name: "Ferocidade", icon: "💢", rankRequired: 7, sortOrder: 4, description: "+8 poder de ataque.", statModifiers: { flat: { attackPower: 8 } } },
  ],
  resource: { manaOnHit: 5 },
};

// ==================== MAGO (caster) ====================
const MAGO = {
  skills: [
    { slug: "mag-cajado", name: "Ataque do Cajado", icon: "🪄", kind: "attack", trigger: "auto", target: "enemy", cooldown: 0, manaCost: 0, description: "Ataque básico com o cajado.", actions: [{ action: "damage", amount: 8, scaling: [{ stat: "attackPower", factor: 0.5 }], damageType: "physical" }] },
    { slug: "mag-bola-fogo", name: "Bola de Fogo", icon: "🔥", kind: "attack", trigger: "active", target: "enemy", cooldown: 4000, manaCost: 20, rankRequired: 1, sortOrder: 1, description: "Projétil de fogo que queima o inimigo.", actions: [{ action: "damage", amount: 28, scaling: [{ stat: "spellPower", factor: 1.1 }], damageType: "magic" }, { action: "applyEffect", effect: "burn", stacks: 1, target: "enemy" }] },
    { slug: "mag-rajada-gelo", name: "Rajada de Gelo", icon: "❄️", kind: "attack", trigger: "active", target: "enemy", cooldown: 8000, manaCost: 25, rankRequired: 3, sortOrder: 2, description: "Gelo que causa dano e lentidão.", actions: [{ action: "damage", amount: 18, scaling: [{ stat: "spellPower", factor: 0.8 }], damageType: "magic" }, { action: "applyEffect", effect: "slow", stacks: 1, target: "enemy" }] },
    { slug: "mag-escudo-arcano", name: "Escudo Arcano", icon: "🔮", kind: "buff", trigger: "active", target: "self", cooldown: 15000, manaCost: 30, rankRequired: 5, sortOrder: 3, description: "Protege com energia arcana.", actions: [{ action: "applyEffect", effect: "fortify", stacks: 1, target: "self" }] },
    { slug: "mag-bomba-arcana", name: "Bomba Arcana", icon: "💥", kind: "attack", trigger: "ultimate", target: "enemy", cooldown: 30000, manaCost: 50, rankRequired: 7, sortOrder: 4, description: "Explosão arcana devastadora.", actions: [{ action: "damage", amount: 70, scaling: [{ stat: "spellPower", factor: 2 }], damageType: "magic" }, { action: "applyEffect", effect: "burn", stacks: 2, target: "enemy" }] },
  ],
  passives: [
    { slug: "mag-mente-aguda", name: "Mente Aguda", icon: "🧠", rankRequired: 1, sortOrder: 1, description: "+5 poder mágico.", statModifiers: { flat: { spellPower: 5 } } },
    { slug: "mag-combustao", name: "Combustão", icon: "♨️", rankRequired: 3, sortOrder: 2, description: "Queimaduras causam +20% dano por tick.", effectModifiers: [{ effectSlug: "burn", tickPercent: 20 }] },
    { slug: "mag-arcano-master", name: "Arcano Master", icon: "🌀", rankRequired: 5, sortOrder: 3, description: "+10% magia.", statModifiers: { percent: { magic: 10 } } },
    { slug: "mag-mana-condensada", name: "Mana Condensada", icon: "💧", rankRequired: 7, sortOrder: 4, description: "Habilidades custam 10% menos mana.", statModifiers: { flat: { manaCostReduction: 10 } } },
  ],
  resource: {},
};

// ==================== ASSASSINO (dps) ====================
const ASSASSINO = {
  skills: [
    { slug: "ass-adaga", name: "Corte de Adaga", icon: "🗡️", kind: "attack", trigger: "auto", target: "enemy", cooldown: 0, manaCost: 0, description: "Ataque básico com adagas.", actions: [{ action: "damage", amount: 10, scaling: [{ stat: "attackPower", factor: 0.8 }], damageType: "physical" }] },
    { slug: "ass-golpe-furtivo", name: "Golpe Furtivo", icon: "🌙", kind: "attack", trigger: "active", target: "enemy", cooldown: 3500, manaCost: 12, rankRequired: 1, sortOrder: 1, description: "Corte rápido que causa sangramento.", actions: [{ action: "damage", amount: 18, scaling: [{ stat: "attackPower", factor: 1.0 }], damageType: "physical" }, { action: "applyEffect", effect: "bleed", stacks: 1, target: "enemy" }] },
    { slug: "ass-marca-sombria", name: "Marca Sombria", icon: "🕳️", kind: "attack", trigger: "active", target: "enemy", cooldown: 10000, manaCost: 20, rankRequired: 3, sortOrder: 2, description: "Enfraquece as defesas do inimigo.", actions: [{ action: "applyEffect", effect: "weakness", stacks: 1, target: "enemy" }, { action: "damage", amount: 12, scaling: [{ stat: "attackPower", factor: 0.5 }], damageType: "physical" }] },
    { slug: "ass-danca-laminas", name: "Dança das Lâminas", icon: "💫", kind: "attack", trigger: "active", target: "enemy", cooldown: 12000, manaCost: 30, rankRequired: 5, sortOrder: 3, description: "Dois cortes rápidos em sequência.", actions: [{ action: "damage", amount: 14, scaling: [{ stat: "attackPower", factor: 0.7 }], damageType: "physical" }, { action: "damage", amount: 14, scaling: [{ stat: "attackPower", factor: 0.7 }], damageType: "physical" }] },
    { slug: "ass-execucao", name: "Execução", icon: "☠️", kind: "attack", trigger: "ultimate", target: "enemy", cooldown: 25000, manaCost: 35, rankRequired: 7, sortOrder: 4, description: "Consome 3 stacks de sangramento para causar dano massivo.", conditions: [{ type: "stacksAtLeast", effect: "bleed", stacks: 3 }], onConditionMet: [{ action: "consumeStacks", effect: "bleed", stacks: 3, target: "enemy" }, { action: "damage", amount: 90, scaling: [{ stat: "attackPower", factor: 2.2 }], damageType: "physical" }], actions: [{ action: "damage", amount: 40, scaling: [{ stat: "attackPower", factor: 1.5 }], damageType: "physical" }] },
  ],
  passives: [
    { slug: "ass-instinto-sombrio", name: "Instinto Sombrio", icon: "👁️", rankRequired: 1, sortOrder: 1, description: "+5% chance de crítico.", statModifiers: { flat: { critChance: 5 } } },
    { slug: "ass-veias-abertas", name: "Veias Abertas", icon: "🩸", rankRequired: 3, sortOrder: 2, description: "Sangramentos causam +25% dano por tick.", effectModifiers: [{ effectSlug: "bleed", tickPercent: 25 }] },
    { slug: "ass-agilidade-felina", name: "Agilidade Felina", icon: "🐈", rankRequired: 5, sortOrder: 3, description: "+5% esquiva.", statModifiers: { flat: { dodge: 5 } } },
    { slug: "ass-letalidade", name: "Letalidade", icon: "🎯", rankRequired: 7, sortOrder: 4, description: "+25% dano crítico.", statModifiers: { flat: { critDamage: 25 } } },
  ],
  resource: { manaOnHit: 4 },
};

// ==================== SUPORTE (support) ====================
const SUPORTE = {
  skills: [
    { slug: "sup-cajado", name: "Golpe do Cajado", icon: "🪄", kind: "attack", trigger: "auto", target: "enemy", cooldown: 0, manaCost: 0, description: "Ataque básico com o cajado.", actions: [{ action: "damage", amount: 8, scaling: [{ stat: "attackPower", factor: 0.5 }], damageType: "physical" }] },
    { slug: "sup-palavra-cura", name: "Palavra de Cura", icon: "💚", kind: "heal", trigger: "active", target: "self", cooldown: 6000, manaCost: 25, rankRequired: 1, sortOrder: 1, description: "Cura uma boa quantidade de vida.", actions: [{ action: "heal", amount: 20, scaling: [{ stat: "spellPower", factor: 1.4 }] }] },
    { slug: "sup-bencao", name: "Benção", icon: "🙏", kind: "buff", trigger: "active", target: "self", cooldown: 15000, manaCost: 20, rankRequired: 3, sortOrder: 2, description: "Fortalece defesa e ataque.", actions: [{ action: "applyEffect", effect: "fortify", stacks: 1, target: "self" }, { action: "applyEffect", effect: "rage", stacks: 1, target: "self" }] },
    { slug: "sup-aura-luz", name: "Aura de Luz", icon: "🌟", kind: "heal", trigger: "ultimate", target: "self", cooldown: 25000, manaCost: 40, rankRequired: 5, sortOrder: 3, description: "Cura e regenera vida ao longo do tempo.", actions: [{ action: "heal", amount: 25, scaling: [{ stat: "spellPower", factor: 1.0 }] }, { action: "applyEffect", effect: "regen", stacks: 1, target: "self" }] },
  ],
  passives: [
    { slug: "sup-toque-suave", name: "Toque Suave", icon: "🤲", rankRequired: 1, sortOrder: 1, description: "+10% cura.", statModifiers: { flat: { healingPercent: 10 } } },
    { slug: "sup-palavras-encorajadoras", name: "Palavras Encorajadoras", icon: "📣", rankRequired: 3, sortOrder: 2, description: "+4 poder mágico.", statModifiers: { flat: { spellPower: 4 } } },
    { slug: "sup-escudo-fe", name: "Escudo da Fé", icon: "🛐", rankRequired: 5, sortOrder: 3, description: "+6 defesa mágica.", statModifiers: { flat: { magicDefense: 6 } } },
    { slug: "sup-bencao-major", name: "Benção Maior", icon: "✨", rankRequired: 7, sortOrder: 4, description: "Regenerações curam +25%.", effectModifiers: [{ effectSlug: "regen", healPercent: 25 }] },
  ],
  resource: {},
};

// ==================== BETA TESTER (Light) ====================
const LIGHT = {
  skills: [
    { slug: "light-estalo", name: "Estalo de Luz", icon: "✨", kind: "attack", trigger: "auto", target: "enemy", cooldown: 0, manaCost: 0, description: "Ataque básico com energia.", actions: [{ action: "damage", amount: 10, scaling: [{ stat: "attackPower", factor: 0.7 }], damageType: "physical" }] },
    { slug: "light-clarao", name: "Clarão", icon: "💡", kind: "attack", trigger: "active", target: "enemy", cooldown: 4000, manaCost: 15, rankRequired: 1, sortOrder: 1, description: "Explosão de luz mágica.", actions: [{ action: "damage", amount: 24, scaling: [{ stat: "spellPower", factor: 1.0 }], damageType: "magic" }] },
    { slug: "light-remendo", name: "Remendo", icon: "🩹", kind: "heal", trigger: "active", target: "self", cooldown: 7000, manaCost: 20, rankRequired: 3, sortOrder: 2, description: "Cura rápida de emergência.", actions: [{ action: "heal", amount: 18, scaling: [{ stat: "spellPower", factor: 1.1 }] }] },
    { slug: "light-poder-supremo", name: "Poder Supremo", icon: "💫", kind: "attack", trigger: "ultimate", target: "enemy", cooldown: 20000, manaCost: 30, rankRequired: 5, sortOrder: 3, description: "Dano mágico massivo e cura parcial.", actions: [{ action: "damage", amount: 55, scaling: [{ stat: "spellPower", factor: 1.5 }], damageType: "magic" }, { action: "heal", amount: 15, scaling: [{ stat: "spellPower", factor: 0.6 }] }] },
  ],
  passives: [
    { slug: "light-talento-natural", name: "Talento Natural", icon: "🎓", rankRequired: 1, sortOrder: 1, description: "+3 poder de ataque e +3 poder mágico.", statModifiers: { flat: { attackPower: 3, spellPower: 3 } } },
    { slug: "light-vigor", name: "Vigor", icon: "💪", rankRequired: 3, sortOrder: 2, description: "+5% vida e +5% mana.", statModifiers: { percent: { hp: 5, mana: 5 } } },
  ],
  resource: { manaOnHit: 3 },
};

async function upsertStatModel(m) {
  return prisma.statModel.upsert({
    where: { slug: m.slug },
    update: { name: m.name, description: m.description, base: m.base, perLevel: m.perLevel, scaling: m.scaling, isActive: true },
    create: { name: m.name, slug: m.slug, description: m.description, base: m.base, perLevel: m.perLevel, scaling: m.scaling, isActive: true },
  });
}

async function upsertEffect(e) {
  return prisma.effect.upsert({
    where: { slug: e.slug },
    update: { ...e },
    create: { ...e },
  });
}

async function seedClass(slug, statModelSlug, resource, data) {
  const gameClass = await prisma.gameClass.findUnique({ where: { slug } });
  if (!gameClass) {
    console.log(`  !! class ${slug} not found, skipping`);
    return;
  }
  const statModel = await prisma.statModel.findUnique({ where: { slug: statModelSlug } });
  await prisma.gameClass.update({
    where: { id: gameClass.id },
    data: { statModelId: statModel.id, resource, rankMax: 10 },
  });

  for (const s of data.skills) {
    const existing = await prisma.skill.findFirst({ where: { slug: s.slug, classId: gameClass.id } });
    if (existing) {
      await prisma.skill.update({ where: { id: existing.id }, data: { ...s, classId: gameClass.id } });
    } else {
      await prisma.skill.create({ data: { ...s, classId: gameClass.id } });
    }
  }
  for (const p of data.passives) {
    const existing = await prisma.passive.findFirst({ where: { slug: p.slug, classId: gameClass.id } });
    if (existing) {
      await prisma.passive.update({ where: { id: existing.id }, data: { ...p, classId: gameClass.id } });
    } else {
      await prisma.passive.create({ data: { ...p, classId: gameClass.id } });
    }
  }
  console.log(`  ${slug}: ${data.skills.length} skills, ${data.passives.length} passives`);
}

async function main() {
  console.log("Creating stat models...");
  for (const m of STAT_MODELS) await upsertStatModel(m);

  console.log("Creating effects...");
  for (const e of EFFECTS) await upsertEffect(e);

  console.log("Linking classes...");
  await seedClass("cavaleiro", "tank", CAVALEIRO.resource, CAVALEIRO);
  await seedClass("mago", "caster", MAGO.resource, MAGO);
  await seedClass("assassino", "dps", ASSASSINO.resource, ASSASSINO);
  await seedClass("suporte", "support", SUPORTE.resource, SUPORTE);
  await seedClass("Light", "hybrid", LIGHT.resource, LIGHT);

  console.log("Done.");
  console.log("statModels:", await prisma.statModel.count());
  console.log("effects:", await prisma.effect.count());
  console.log("skills:", await prisma.skill.count());
  console.log("passives:", await prisma.passive.count());
}

main()
  .catch((e) => {
    console.error("ERROR:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
