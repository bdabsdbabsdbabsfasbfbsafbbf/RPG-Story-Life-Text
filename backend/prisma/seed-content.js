// Seed content: starter classes, races, traits + promote Darkin to admin.
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

const races = [
  {
    name: "Humano",
    slug: "humano",
    description: "Versátil e adaptável, o Humano se destaca por equilibrar todos os atributos com leve vantagem em resistência.",
    traits: { baseHp: 15, baseMana: 10, baseAttack: 3, baseDefense: 3, baseMagic: 3, baseMagicDefense: 3, baseSpeed: 2, manaRecovery: 0.5 },
  },
  {
    name: "Elfo",
    slug: "elfo",
    description: "Gracioso e ágil, o Elfo canaliza magia com facilidade e se move com velocidade sobrenatural.",
    traits: { baseHp: -10, baseMana: 35, baseAttack: 2, baseDefense: -2, baseMagic: 8, baseMagicDefense: 4, baseSpeed: 6, manaRecovery: 2.0 },
  },
  {
    name: "Anão",
    slug: "anao",
    description: "Robusto e teimoso, o Anão aguenta golpes que derrubariam outros e é imune à maioria dos medos.",
    traits: { baseHp: 45, baseMana: -15, baseAttack: 4, baseDefense: 10, baseMagic: -3, baseMagicDefense: 8, baseSpeed: -3, manaRecovery: -0.5 },
  },
  {
    name: "Orc",
    slug: "orc",
    description: "Guerreiro nato, o Orc transforma fúria em poder bruto, causando dano devastador a cada golpe.",
    traits: { baseHp: 30, baseMana: -20, baseAttack: 12, baseDefense: 4, baseMagic: -5, baseMagicDefense: -2, baseSpeed: -1, manaRecovery: -1.0 },
  },
  {
    name: "Draconato",
    slug: "draconato",
    description: "Herdeiro do sangue dos dragões, resiste a magias e inspira temor com sua presença imponente.",
    traits: { baseHp: 20, baseMana: 15, baseAttack: 6, baseDefense: 6, baseMagic: 6, baseMagicDefense: 6, baseSpeed: 0, manaRecovery: 1.0 },
  },
  {
    name: "Fada",
    slug: "fada",
    description: "Diminuta e encantadora, a Fada é imune ao cansaço, esquiva-se de quase tudo e encanta a todos.",
    traits: { baseHp: -25, baseMana: 50, baseAttack: -2, baseDefense: -4, baseMagic: 10, baseMagicDefense: 2, baseSpeed: 10, manaRecovery: 3.0 },
  },
  {
    name: "Vampiro",
    slug: "vampiro",
    description: "Imortal e sedutor, o Vampiro drena a vitalidade dos inimigos e recupera mana à noite.",
    traits: { baseHp: 25, baseMana: 25, baseAttack: 8, baseDefense: 2, baseMagic: 8, baseMagicDefense: 5, baseSpeed: 4, manaRecovery: 2.5 },
  },
  {
    name: "Meio-Demônio",
    slug: "meio-demonio",
    description: "Forjado no fogo, o Meio-Demônio troca a vida por poder e sua magia ardente queima qualquer adversário.",
    traits: { baseHp: -5, baseMana: 20, baseAttack: 9, baseDefense: -2, baseMagic: 12, baseMagicDefense: -2, baseSpeed: 3, manaRecovery: 1.5 },
  },
];

const traits = [
  {
    name: "Sanguinário",
    slug: "sanguinario",
    description: "Seu ímpeto em combate aumenta os acertos críticos em 8% e o dano crítico em 15%.",
    modifiers: { critBonus: 8, critDamageBonus: 15 },
  },
  {
    name: "Sortudo",
    slug: "sortudo",
    description: "A sorte favorece os audazes: +10% de esquiva e maior chance de encontrar tesouros.",
    modifiers: { dodgeBonus: 10, luckBonus: 10 },
  },
  {
    name: "Gênio",
    slug: "genio",
    description: "Mente brilhante: reduz o cooldown de todas as habilidades em 10%.",
    modifiers: { cooldownReduction: 10 },
  },
  {
    name: "Ambicioso",
    slug: "ambicioso",
    description: "Sua ganância rende +15% de ouro em todas as recompensas.",
    modifiers: { goldBonus: 15 },
  },
  {
    name: "Erudito",
    slug: "erudito",
    description: "Viciado em conhecimento: +15% de experiência de todas as fontes.",
    modifiers: { xpBonus: 15 },
  },
  {
    name: "Imortal",
    slug: "imortal",
    description: "Difícil de derrubar: regenera 2% da vida máxima a cada rodada de combate.",
    modifiers: { regenPercent: 2, maxHpBonus: 8 },
  },
  {
    name: "Veloz",
    slug: "veloz",
    description: "Mais rápido que a sombra: +8 de velocidade e ataque 10% mais ágil.",
    modifiers: { speedBonus: 8, attackSpeedBonus: 10 },
  },
  {
    name: "Sombrio",
    slug: "sombrio",
    description: "A escuridão o fortalece: +10% de dano em inimigos com menos da metade da vida.",
    modifiers: { executeBonus: 10, darkResistance: 10 },
  },
];

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

  console.log("Seeding races...");
  for (const race of races) {
    await prisma.race.upsert({
      where: { slug: race.slug },
      update: { ...race, isActive: true },
      create: { ...race, isActive: true },
    });
    console.log("  race:", race.slug);
  }

  console.log("Seeding traits...");
  for (const trait of traits) {
    await prisma.trait.upsert({
      where: { slug: trait.slug },
      update: { ...trait, isActive: true },
      create: { ...trait, isActive: true },
    });
    console.log("  trait:", trait.slug);
  }

  console.log("Promoting Darkin to admin...");
  const darkin = await prisma.user.updateMany({
    where: { username: "Darkin" },
    data: { role: "admin" },
  });
  console.log("  users updated:", darkin.count);

  const [classes, raceCount, traitCount, users] = await Promise.all([
    prisma.gameClass.count(),
    prisma.race.count(),
    prisma.trait.count(),
    prisma.user.findMany({ select: { username: true, role: true, raceRerolls: true, traitRerolls: true } }),
  ]);
  console.log("DONE. classes:", classes, "| races:", raceCount, "| traits:", traitCount);
  console.log("users:", JSON.stringify(users));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
