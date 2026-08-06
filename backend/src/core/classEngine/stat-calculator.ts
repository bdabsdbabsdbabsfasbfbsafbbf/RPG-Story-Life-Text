import { DerivedStats, PassiveDef } from "./types";
import { CoreStats, sumCoreStats } from "../stats/coreStats";

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
  hitChance: 100,
  critChance: 5,
  critDamage: 150,
  dodge: 2,
  attackSpeedMs: 2000,
  manaRegenPerTick: 5,
  healthRegenPerTick: 0,
  threatPerAttack: 1,
  aggroPerHit: 1,
  damagePercent: 0,
  physicalDamagePercent: 0,
  magicalDamagePercent: 0,
  damageResistance: 0,
  physicalResistance: 0,
  magicalResistance: 0,
  penetration: 0,
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

export interface StatConversion {
  stat: string; // strength, intellect, endurance, dexterity, wisdom, luck
  target: string; // attackPower, spellPower, critChance, critDamage, dodge, hitChance, attackSpeedPercent, cooldownReduction, hp, mana, defense, magicDefense
  factor: number;
}

export interface StatsInput {
  level: number;
  hp?: number;
  mana?: number;
  statModel: {
    base?: Record<string, any>;
    perLevel?: Record<string, any>;
    scaling?: Record<string, any>;
    coreStats?: Record<string, any>;
    conversions?: StatConversion[];
    attackIntervalBase?: number;
    combatStatsBase?: Record<string, any>;
    bonuses?: Record<string, any>;
  };
  resource?: Record<string, any>;
  passives: PassiveDef[]; // apenas passivas desbloqueadas pelo rank
  coreStats?: CoreStats; // Core Stats vindos de equipamentos + encantamentos
  attackSpeedMs?: number; // override vindo da arma equipada (0 = usa o scaling da classe)
  weaponDps?: number; // DPS natural da arma equipada (soma ao attack power)
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

// Conversões de atributos (core stats) -> combat stats definidas pelo Stat Model.
// Retorna { combatKey: valor } somando cada conversão do modelo sobre o total de atributos.
function applyConversions(conversions: StatConversion[] | undefined, core: CoreStats): Record<string, number> {
  const out: Record<string, number> = {};
  if (!conversions) return out;
  for (const c of conversions) {
    const value = num(core[c.stat as keyof CoreStats], 0) * num(c.factor, 0);
    if (value === 0) continue;
    out[c.target] = (out[c.target] || 0) + value;
  }
  return out;
}

export function computeStats(input: StatsInput): DerivedStats {
  const base = input.statModel?.base || {};
  const perLevel = input.statModel?.perLevel || {};
  const scaling = input.statModel?.scaling || {};
  const resource = input.resource || {};
  const level = Math.max(1, input.level);
  const coreStatsBase = input.statModel?.coreStats || {};

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

  // Core stats do modelo: FIXOS (concedidos no nível 1, não crescem por nível) + equipamentos/encantamentos
  const modelCore = sumCoreStats([
    {
      strength: pickFrom(coreStatsBase, "strength"),
      intellect: pickFrom(coreStatsBase, "intellect"),
      endurance: pickFrom(coreStatsBase, "endurance"),
      dexterity: pickFrom(coreStatsBase, "dexterity"),
      wisdom: pickFrom(coreStatsBase, "wisdom"),
      luck: pickFrom(coreStatsBase, "luck"),
    },
  ]);
  const totalCore = sumCoreStats([modelCore, input.coreStats]);

  const combatStatsBase = input.statModel?.combatStatsBase || {};
  const bonuses = input.statModel?.bonuses || {};
  const conversions = applyConversions(input.statModel?.conversions, totalCore);

  // Conversões que alimentam os núcleos
  stats.hp += conversions.hp || 0;
  stats.mana += conversions.mana || 0;
  stats.defense += conversions.defense || 0;
  stats.magicDefense += conversions.magicDefense || 0;

  stats.hitChance = Math.min(100, num(combatStatsBase.hitChance, 100) + (conversions.hitChance || 0) + flatPassiveMods(input.passives, "hitChance") + percentPassiveMods(input.passives, "hitChance"));
  stats.critChance = Math.max(0, num(combatStatsBase.critChance, 0) + stats.speed * num(scaling.critChancePerSpeed, 0.05) + (conversions.critChance || 0) + flatPassiveMods(input.passives, "critChance") + percentPassiveMods(input.passives, "critChance"));
  stats.critDamage = Math.max(50, num(combatStatsBase.critMultiplier, num(scaling.critDamageBase, 150)) + (conversions.critDamage || 0) + flatPassiveMods(input.passives, "critDamage") + percentPassiveMods(input.passives, "critDamage"));
  stats.dodge = Math.min(60, Math.max(0, num(combatStatsBase.evasion, 0) + stats.speed * num(scaling.dodgePerSpeed, 0.02) + (conversions.dodge || 0) + flatPassiveMods(input.passives, "dodge") + percentPassiveMods(input.passives, "dodge")));
  stats.cooldownReduction = num(combatStatsBase.cooldownReduction, 0) + (conversions.cooldownReduction || 0) + flatPassiveMods(input.passives, "cooldownReduction") + percentPassiveMods(input.passives, "cooldownReduction");

  // Attack Speed: NUNCA redução direta em ms. Intervalo final = Base ÷ (1 + AttackSpeed%).
  const attackIntervalBase = Math.max(100, input.statModel?.attackIntervalBase ? num(input.statModel.attackIntervalBase, 1000) : num(scaling.attackSpeedMs, 2000));
  const attackSpeedPercent = (conversions.attackSpeedPercent || 0) + percentPassiveMods(input.passives, "attackSpeed") + num(bonuses.attackSpeed, 0);
  stats.attackSpeedMs = Math.max(100, Math.round(attackIntervalBase / (1 + attackSpeedPercent / 100)));
  if (input.attackSpeedMs && input.attackSpeedMs > 0) {
    stats.attackSpeedMs = Math.max(100, input.attackSpeedMs);
  }

  stats.manaRegenPerTick = num(resource.manaRegenPerTick, num(scaling.manaRegenPerTick, 5)) + flatPassiveMods(input.passives, "manaRegen");
  stats.healthRegenPerTick = num(scaling.healthRegenPerTick, 0) + flatPassiveMods(input.passives, "healthRegen");
  stats.threatPerAttack = num(scaling.threatPerAttack, 1);
  stats.aggroPerHit = num(scaling.aggroPerHit, 1);

  // Amplificadores: modelo (bônus) + passivas (flat e percent)
  stats.damagePercent += num(bonuses.damageBoost, 0) + flatPassiveMods(input.passives, "damagePercent") + percentPassiveMods(input.passives, "damagePercent");
  stats.physicalDamagePercent += num(bonuses.physicalBoost, 0) + flatPassiveMods(input.passives, "physicalDamagePercent") + percentPassiveMods(input.passives, "physicalDamagePercent");
  stats.magicalDamagePercent += num(bonuses.magicalBoost, 0) + flatPassiveMods(input.passives, "magicDamagePercent") + percentPassiveMods(input.passives, "magicDamagePercent");
  stats.healingPercent += num(bonuses.healingBoost, 0) + flatPassiveMods(input.passives, "healingPercent") + percentPassiveMods(input.passives, "healingPercent");
  stats.dotPercent += flatPassiveMods(input.passives, "dotPercent") + percentPassiveMods(input.passives, "dotPercent");
  stats.overhealPercent += flatPassiveMods(input.passives, "overhealPercent") + percentPassiveMods(input.passives, "overhealPercent");
  stats.manaCostReduction += flatPassiveMods(input.passives, "manaCostReduction") + percentPassiveMods(input.passives, "manaCostReduction");
  stats.cooldownReduction += flatPassiveMods(input.passives, "cooldownReduction") + percentPassiveMods(input.passives, "cooldownReduction");

  // Resistências e penetração do modelo
  stats.damageResistance += num(bonuses.damageResistance, 0) + flatPassiveMods(input.passives, "damageResistance");
  stats.physicalResistance += num(bonuses.physicalResistance, 0) + flatPassiveMods(input.passives, "physicalResistance");
  stats.magicalResistance += num(bonuses.magicalResistance, 0) + flatPassiveMods(input.passives, "magicalResistance");
  stats.penetration += num(bonuses.penetration, 0) + flatPassiveMods(input.passives, "penetration");

  // Boost de defesa (booster de anel/colar): +X% de resistência física E mágica
  const defenseBoost = num(bonuses.defenseBoost, 0);
  stats.physicalResistance += defenseBoost;
  stats.magicalResistance += defenseBoost;

  // Percentuais aplicados aos núcleos (passivas "percent")
  stats.hp = Math.floor(applyPercent(stats.hp, percentPassiveMods(input.passives, "hp")));
  stats.mana = Math.floor(applyPercent(stats.mana, percentPassiveMods(input.passives, "mana")));
  stats.attack = Math.floor(applyPercent(stats.attack, percentPassiveMods(input.passives, "attack")));
  stats.defense = Math.floor(applyPercent(stats.defense, percentPassiveMods(input.passives, "defense")));
  stats.magic = Math.floor(applyPercent(stats.magic, percentPassiveMods(input.passives, "magic")));
  stats.magicDefense = Math.floor(applyPercent(stats.magicDefense, percentPassiveMods(input.passives, "magicDefense")));
  stats.speed = Math.floor(applyPercent(stats.speed, percentPassiveMods(input.passives, "speed")));

  // Attack/Skill Power: base do modelo + conversões de atributos
  const modelAttackBase = applyPercent(stats.attack, percentPassiveMods(input.passives, "attackPower"));
  stats.attackPower = Math.max(1, Math.floor(modelAttackBase * num(scaling.attackPowerPerAttack, 1) + (conversions.attackPower || 0)));
  const modelSpellBase = applyPercent(stats.magic, percentPassiveMods(input.passives, "spellPower"));
  stats.spellPower = Math.max(1, Math.floor(modelSpellBase * num(scaling.spellPowerPerMagic, 1) + (conversions.spellPower || 0)));
  stats.maxHp = stats.hp;
  stats.maxMana = stats.mana;
  stats.attackPower = Math.floor(applyPercent(stats.attackPower, percentPassiveMods(input.passives, "attackPowerPercent")));
  stats.spellPower = Math.floor(applyPercent(stats.spellPower, percentPassiveMods(input.passives, "spellPowerPercent")));
  if (input.weaponDps) {
    stats.attackPower = Math.floor(stats.attackPower + (input.weaponDps * stats.attackSpeedMs) / 1000);
  }

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
