import { DerivedStats, PassiveDef } from "./types";

const CORE_KEYS = ["hp", "mana", "attack", "defense", "magic", "magicDefense", "speed"] as const;
const BASE_STATS: DerivedStats = {
  level: 1,
  hp: 100,
  mana: 50,
  attack: 10,
  defense: 10,
  magic: 10,
  magicDefense: 10,
  speed: 10,
  attackPower: 10,
  spellPower: 10,
  critChance: 5,
  critDamage: 150,
  dodge: 2,
  attackSpeedMs: 2000,
  manaRegenPerTick: 5,
  healthRegenPerTick: 0,
  threatPerAttack: 1,
  aggroPerHit: 1,
  damagePercent: 0,
  magicDamagePercent: 0,
  healingPercent: 0,
  dotPercent: 0,
  overhealPercent: 0,
  manaCostReduction: 0,
  cooldownReduction: 0,
};

function num(v: any, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Lê um objeto JSON de stats tolerando chaves conhecidas: baseHp/hp, baseAttack/attack...
const KEY_ALIASES: Record<string, string[]> = {
  hp: ["baseHp", "hp", "maxHp"],
  mana: ["baseMana", "mana", "maxMana"],
  attack: ["baseAttack", "attack", "atk"],
  defense: ["baseDefense", "defense", "def"],
  magic: ["baseMagic", "magic", "magicAttack", "magicPower"],
  magicDefense: ["baseMagicDefense", "magicDefense", "magicResist"],
  speed: ["baseSpeed", "speed"],
  critChance: ["critChance", "critBonus"],
  dodge: ["dodge", "dodgeBonus"],
};

function pickFrom(record: Record<string, any>, target: string): number {
  for (const alias of KEY_ALIASES[target] || [target]) {
    const v = record[alias];
    if (v !== undefined && v !== null) return Number(v) || 0;
  }
  return 0;
}

function plus(acc: Record<string, number>, record: Record<string, any>, key: string): number {
  return acc[key] + pickFrom(record, key);
}

export interface StatsInput {
  level: number;
  hp?: number;
  mana?: number;
  statModel: {
    base?: Record<string, any>;
    perLevel?: Record<string, any>;
    scaling?: Record<string, any>;
  };
  resource?: Record<string, any>;
  passives: PassiveDef[]; // apenas passivas desbloqueadas pelo rank
  raceTraits?: Record<string, any>;
  traitModifiers?: Record<string, any>;
  equipmentStats?: Array<Record<string, any>>;
}

function flatPassiveMods(passives: PassiveDef[], key: string): number {
  let total = 0;
  for (const p of passives) {
    if (p.statModifiers?.flat) total += num(p.statModifiers.flat[key], 0);
  }
  return total;
}

function percentPassiveMods(passives: PassiveDef[], key: string): number {
  let total = 0;
  for (const p of passives) {
    if (p.statModifiers?.percent) total += num(p.statModifiers.percent[key], 0);
  }
  return total;
}

function applyPercent(stat: number, totalPercent: number): number {
  return stat * (1 + totalPercent / 100);
}

export function computeStats(input: StatsInput): DerivedStats {
  const base = input.statModel?.base || {};
  const perLevel = input.statModel?.perLevel || {};
  const scaling = input.statModel?.scaling || {};
  const resource = input.resource || {};
  const level = Math.max(1, input.level);

  const stats: DerivedStats = { ...BASE_STATS };

  for (const key of CORE_KEYS) {
    stats[key] = Math.max(0, Math.floor(pickFrom(base, key) + pickFrom(perLevel, key) * (level - 1)));
  }

  stats.hp += flatPassiveMods(input.passives, "hp");
  stats.mana += flatPassiveMods(input.passives, "mana");
  stats.attack += flatPassiveMods(input.passives, "attack");
  stats.defense += flatPassiveMods(input.passives, "defense");
  stats.magic += flatPassiveMods(input.passives, "magic");
  stats.magicDefense += flatPassiveMods(input.passives, "magicDefense");
  stats.speed += flatPassiveMods(input.passives, "speed");

  if (input.raceTraits) {
    stats.hp = plus(stats as any, input.raceTraits, "hp");
    stats.mana = plus(stats as any, input.raceTraits, "mana");
    stats.attack = plus(stats as any, input.raceTraits, "attack");
    stats.defense = plus(stats as any, input.raceTraits, "defense");
    stats.magic = plus(stats as any, input.raceTraits, "magic");
    stats.magicDefense = plus(stats as any, input.raceTraits, "magicDefense");
    stats.speed = plus(stats as any, input.raceTraits, "speed");
  }

  if (input.equipmentStats) {
    for (const eq of input.equipmentStats) {
      stats.hp = plus(stats as any, eq, "hp");
      stats.mana = plus(stats as any, eq, "mana");
      stats.attack = plus(stats as any, eq, "attack");
      stats.defense = plus(stats as any, eq, "defense");
      stats.magic = plus(stats as any, eq, "magic");
      stats.magicDefense = plus(stats as any, eq, "magicDefense");
      stats.speed = plus(stats as any, eq, "speed");
    }
  }

  // Derivados
  stats.attackPower = Math.max(1, Math.floor(stats.attack * num(scaling.attackPowerPerAttack, 1)));
  stats.spellPower = Math.max(1, Math.floor(stats.magic * num(scaling.spellPowerPerMagic, 1)));
  stats.critChance = Math.max(0, stats.speed * num(scaling.critChancePerSpeed, 0.05) + flatPassiveMods(input.passives, "critChance"));
  stats.critDamage = num(scaling.critDamageBase, 150) + flatPassiveMods(input.passives, "critDamage");
  stats.dodge = Math.min(60, Math.max(0, stats.speed * num(scaling.dodgePerSpeed, 0.02) + flatPassiveMods(input.passives, "dodge")));
  stats.attackSpeedMs = Math.max(500, num(scaling.attackSpeedMs, 2000));
  stats.manaRegenPerTick = num(resource.manaRegenPerTick, num(scaling.manaRegenPerTick, 5)) + flatPassiveMods(input.passives, "manaRegen");
  stats.healthRegenPerTick = num(scaling.healthRegenPerTick, 0) + flatPassiveMods(input.passives, "healthRegen");
  stats.threatPerAttack = num(scaling.threatPerAttack, 1);
  stats.aggroPerHit = num(scaling.aggroPerHit, 1);

  // Amplificadores vindos de passivas/traços
  stats.damagePercent += flatPassiveMods(input.passives, "damagePercent");
  stats.magicDamagePercent += flatPassiveMods(input.passives, "magicDamagePercent");
  stats.healingPercent += flatPassiveMods(input.passives, "healingPercent");
  stats.dotPercent += flatPassiveMods(input.passives, "dotPercent");
  stats.overhealPercent += flatPassiveMods(input.passives, "overhealPercent");
  stats.manaCostReduction += flatPassiveMods(input.passives, "manaCostReduction");
  stats.cooldownReduction += flatPassiveMods(input.passives, "cooldownReduction");

  if (input.traitModifiers) {
    stats.critChance += pickFrom(input.traitModifiers, "critChance");
    stats.dodge += pickFrom(input.traitModifiers, "dodge");
    stats.cooldownReduction += pickFrom(input.traitModifiers, "cooldownReduction");
  }

  // Percentuais aplicados aos núcleos (passivas "percent")
  stats.hp = Math.floor(applyPercent(stats.hp, percentPassiveMods(input.passives, "hp")));
  stats.mana = Math.floor(applyPercent(stats.mana, percentPassiveMods(input.passives, "mana")));
  stats.attack = Math.floor(applyPercent(stats.attack, percentPassiveMods(input.passives, "attack")));
  stats.defense = Math.floor(applyPercent(stats.defense, percentPassiveMods(input.passives, "defense")));
  stats.magic = Math.floor(applyPercent(stats.magic, percentPassiveMods(input.passives, "magic")));
  stats.magicDefense = Math.floor(applyPercent(stats.magicDefense, percentPassiveMods(input.passives, "magicDefense")));
  stats.speed = Math.floor(applyPercent(stats.speed, percentPassiveMods(input.passives, "speed")));

  stats.maxHp = stats.hp;
  stats.maxMana = stats.mana;
  stats.attackPower = Math.floor(applyPercent(stats.attackPower, percentPassiveMods(input.passives, "attackPower")));
  stats.spellPower = Math.floor(applyPercent(stats.spellPower, percentPassiveMods(input.passives, "spellPower")));

  return stats;
}

export function computeMonsterStats(monster: any): DerivedStats {
  const stats: DerivedStats = { ...BASE_STATS };
  stats.level = monster.level ?? 1;
  stats.hp = num(monster.hp, 50);
  stats.mana = num(monster.mana, 20);
  stats.attack = num(monster.attack, 10);
  stats.defense = num(monster.defense, 5);
  stats.magic = num(monster.magic, 5);
  stats.magicDefense = num(monster.magicDefense, 5);
  stats.speed = num(monster.speed, 10);
  stats.attackPower = stats.attack;
  stats.spellPower = stats.magic;
  stats.critChance = num(monster.criticalChance, 2);
  stats.critDamage = num(monster.criticalDamage, 150);
  stats.dodge = num(monster.dodge, 1);
  stats.attackSpeedMs = Math.max(800, num(monster.attackSpeed, 2000));
  stats.maxHp = stats.hp;
  stats.maxMana = stats.mana;
  return stats;
}

export function applyStatModifiers(stats: DerivedStats, mods: { flat?: Record<string, number>; percent?: Record<string, number> }): DerivedStats {
  const next = { ...stats };
  if (mods.flat) {
    for (const [k, v] of Object.entries(mods.flat)) {
      if (k in next || k === "maxHp" || k === "maxMana") {
        const target = k === "maxHp" ? "hp" : k === "maxMana" ? "mana" : k;
        next[target] = Math.max(0, next[target] + Number(v) || 0);
      }
    }
  }
  if (mods.percent) {
    for (const [k, v] of Object.entries(mods.percent)) {
      const target = k === "maxHp" ? "hp" : k === "maxMana" ? "mana" : k;
      if (target in next) {
        next[target] = Math.max(0, next[target] * (1 + (Number(v) || 0) / 100));
      }
    }
  }
  next.maxHp = next.hp;
  next.maxMana = next.mana;
  return next;
}
