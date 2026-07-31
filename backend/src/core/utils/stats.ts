// ===== Core Stats (raw from class + equipment) =====
export interface CoreStats {
  weaponDamageMin: number;
  weaponDamageMax: number;
  classEnchant: string | null;
  weaponEnchant: string | null;
  helmetEnchant: string | null;
  capeEnchant: string | null;
  baseHp: number;
  baseMana: number;
  baseAttack: number;
  baseDefense: number;
  baseMagic: number;
  baseMagicDefense: number;
  baseSpeed: number;
}

// ===== Modifier Stats (boost / resistance / penetration) =====
export interface ModifierStats {
  damageBoost: number;
  damageResistance: number;
  physicalBoost: number;
  magicalBoost: number;
  elementalDamage: number;
  physicalResist: number;
  magicalResist: number;
  healingBoost: number;
  healingReceived: number;
  dotBoost: number;
  dotResistance: number;
  armorPenetration: number;
  magicPenetration: number;
  trueDamage: number;
  lifeSteal: number;
  manaSteal: number;
  cooldownReduction: number;
  haste: number;
  manaCostReduction: number;
}

// ===== Combat Stats (final calculated values) =====
export interface CombatStats {
  attackPower: number;
  spellPower: number;
  criticalChance: number;
  criticalMultiplier: number;
  hitChance: number;
  dodgeChance: number;
  attackSpeed: number;
  cooldownReductionTotal: number;
  manaRegen: number;
  healthRegen: number;
  maxHp: number;
  maxMana: number;
  threat: number;
  aggro: number;
  pvpDamage: number;
  pveDamage: number;
  bossDamage: number;
  eliteDamage: number;
  elementalDamage: number;
  resistance: number;
  luck: number;
  dropRate: number;
  goldBonus: number;
  xpBonus: number;
  speed: number;
}

// ===== Full Stat Panel =====
export interface StatPanel {
  core: CoreStats;
  modifiers: ModifierStats;
  combat: CombatStats;
}

// ===== Stat Model Formulas =====
// Each statModel (tank, hybrid, luckHybrid, powerCaster, physicalDPS, magicDPS, support, assassin, bruiser, battleMage)
// defines how base stats convert to combat stats
export type StatModelType =
  | 'tank'
  | 'hybrid'
  | 'luckHybrid'
  | 'powerCaster'
  | 'physicalDPS'
  | 'magicDPS'
  | 'support'
  | 'assassin'
  | 'bruiser'
  | 'battleMage';

export const STAT_MODEL_SCALING: Record<StatModelType, {
  attackPower: { formula: string; attackWeight: number; magicWeight: number };
  spellPower: { formula: string; attackWeight: number; magicWeight: number };
  critChancePerLuck: number;
  critMultiplierBase: number;
  dodgePerSpeed: number;
  hpMultiplier: number;
  manaMultiplier: number;
  threatMultiplier: number;
  aggroMultiplier: number;
  manaRegenPerWisdom: number;
}> = {
  tank: {
    attackPower: { formula: 'attack * 0.8', attackWeight: 0.8, magicWeight: 0 },
    spellPower: { formula: 'magic * 0.4', attackWeight: 0, magicWeight: 0.4 },
    critChancePerLuck: 0.02,
    critMultiplierBase: 130,
    dodgePerSpeed: 0.01,
    hpMultiplier: 1.8,
    manaMultiplier: 0.6,
    threatMultiplier: 2.0,
    aggroMultiplier: 2.0,
    manaRegenPerWisdom: 0.2,
  },
  hybrid: {
    attackPower: { formula: 'attack * 0.6 + magic * 0.3', attackWeight: 0.6, magicWeight: 0.3 },
    spellPower: { formula: 'magic * 0.5 + attack * 0.3', attackWeight: 0.3, magicWeight: 0.5 },
    critChancePerLuck: 0.04,
    critMultiplierBase: 150,
    dodgePerSpeed: 0.02,
    hpMultiplier: 1.2,
    manaMultiplier: 1.0,
    threatMultiplier: 1.0,
    aggroMultiplier: 1.0,
    manaRegenPerWisdom: 0.4,
  },
  luckHybrid: {
    attackPower: { formula: 'attack * 0.5 + luck * 0.4', attackWeight: 0.5, magicWeight: 0 },
    spellPower: { formula: 'magic * 0.5 + luck * 0.4', attackWeight: 0, magicWeight: 0.5 },
    critChancePerLuck: 0.08,
    critMultiplierBase: 180,
    dodgePerSpeed: 0.03,
    hpMultiplier: 1.0,
    manaMultiplier: 1.0,
    threatMultiplier: 0.8,
    aggroMultiplier: 0.8,
    manaRegenPerWisdom: 0.3,
  },
  powerCaster: {
    attackPower: { formula: 'attack * 0.2', attackWeight: 0.2, magicWeight: 0 },
    spellPower: { formula: 'magic * 1.2', attackWeight: 0, magicWeight: 1.2 },
    critChancePerLuck: 0.05,
    critMultiplierBase: 160,
    dodgePerSpeed: 0.01,
    hpMultiplier: 0.7,
    manaMultiplier: 1.8,
    threatMultiplier: 0.6,
    aggroMultiplier: 0.5,
    manaRegenPerWisdom: 0.8,
  },
  physicalDPS: {
    attackPower: { formula: 'attack * 1.0', attackWeight: 1.0, magicWeight: 0 },
    spellPower: { formula: 'magic * 0.2', attackWeight: 0, magicWeight: 0.2 },
    critChancePerLuck: 0.06,
    critMultiplierBase: 170,
    dodgePerSpeed: 0.02,
    hpMultiplier: 1.1,
    manaMultiplier: 0.4,
    threatMultiplier: 1.2,
    aggroMultiplier: 1.0,
    manaRegenPerWisdom: 0.2,
  },
  magicDPS: {
    attackPower: { formula: 'attack * 0.3', attackWeight: 0.3, magicWeight: 0 },
    spellPower: { formula: 'magic * 1.0', attackWeight: 0, magicWeight: 1.0 },
    critChancePerLuck: 0.06,
    critMultiplierBase: 165,
    dodgePerSpeed: 0.02,
    hpMultiplier: 0.8,
    manaMultiplier: 1.5,
    threatMultiplier: 0.8,
    aggroMultiplier: 0.7,
    manaRegenPerWisdom: 0.6,
  },
  support: {
    attackPower: { formula: 'attack * 0.4', attackWeight: 0.4, magicWeight: 0 },
    spellPower: { formula: 'magic * 0.7', attackWeight: 0, magicWeight: 0.7 },
    critChancePerLuck: 0.04,
    critMultiplierBase: 140,
    dodgePerSpeed: 0.03,
    hpMultiplier: 1.0,
    manaMultiplier: 1.4,
    threatMultiplier: 0.4,
    aggroMultiplier: 0.3,
    manaRegenPerWisdom: 1.0,
  },
  assassin: {
    attackPower: { formula: 'attack * 0.9', attackWeight: 0.9, magicWeight: 0 },
    spellPower: { formula: 'magic * 0.5', attackWeight: 0, magicWeight: 0.5 },
    critChancePerLuck: 0.08,
    critMultiplierBase: 200,
    dodgePerSpeed: 0.04,
    hpMultiplier: 0.8,
    manaMultiplier: 0.8,
    threatMultiplier: 0.5,
    aggroMultiplier: 0.4,
    manaRegenPerWisdom: 0.3,
  },
  bruiser: {
    attackPower: { formula: 'attack * 0.9', attackWeight: 0.9, magicWeight: 0 },
    spellPower: { formula: 'magic * 0.3', attackWeight: 0, magicWeight: 0.3 },
    critChancePerLuck: 0.04,
    critMultiplierBase: 150,
    dodgePerSpeed: 0.01,
    hpMultiplier: 1.5,
    manaMultiplier: 0.6,
    threatMultiplier: 1.5,
    aggroMultiplier: 1.3,
    manaRegenPerWisdom: 0.2,
  },
  battleMage: {
    attackPower: { formula: 'attack * 0.7 + magic * 0.3', attackWeight: 0.7, magicWeight: 0.3 },
    spellPower: { formula: 'magic * 0.7 + attack * 0.3', attackWeight: 0.3, magicWeight: 0.7 },
    critChancePerLuck: 0.05,
    critMultiplierBase: 160,
    dodgePerSpeed: 0.02,
    hpMultiplier: 1.3,
    manaMultiplier: 1.2,
    threatMultiplier: 1.0,
    aggroMultiplier: 0.9,
    manaRegenPerWisdom: 0.5,
  },
};

// Calculate combat stats from core + modifiers using class stat model
export function calculateCombatStats(
  core: CoreStats,
  modifiers: ModifierStats,
  statModel: StatModelType,
  classScaling: { attackScaling: number; magicScaling: number; critScaling: number; critDamageBase: number; dodgeScaling: number; cooldownScaling: number; manaEfficiency: number }
): CombatStats {
  const model = STAT_MODEL_SCALING[statModel] || STAT_MODEL_SCALING.hybrid;

  const effectiveAttack = core.baseAttack * classScaling.attackScaling;
  const effectiveMagic = core.baseMagic * classScaling.magicScaling;

  const attackPower = Math.floor(
    effectiveAttack * model.attackPower.attackWeight + effectiveMagic * model.attackPower.magicWeight
  );
  const spellPower = Math.floor(
    effectiveAttack * model.spellPower.attackWeight + effectiveMagic * model.spellPower.magicWeight
  );

  return {
    attackPower,
    spellPower,
    criticalChance: Math.min(95, core.baseSpeed * classScaling.critScaling),
    criticalMultiplier: classScaling.critDamageBase + modifiers.damageBoost,
    hitChance: 95,
    dodgeChance: Math.min(50, core.baseSpeed * classScaling.dodgeScaling),
    attackSpeed: Math.max(200, 1000 - modifiers.haste * 5),
    cooldownReductionTotal: Math.min(80, modifiers.cooldownReduction),
    manaRegen: classScaling.manaEfficiency * model.manaRegenPerWisdom * (core.baseMana / 50),
    healthRegen: model.hpMultiplier * 0.5,
    maxHp: Math.floor(core.baseHp * model.hpMultiplier + modifiers.damageResistance * 0.5),
    maxMana: Math.floor(core.baseMana * model.manaMultiplier),
    threat: model.threatMultiplier * (100 + modifiers.damageBoost),
    aggro: model.aggroMultiplier * (100 + modifiers.damageBoost),
    pvpDamage: 100 + modifiers.physicalBoost,
    pveDamage: 100 + modifiers.physicalBoost,
    bossDamage: 100 + modifiers.damageBoost,
    eliteDamage: 100 + modifiers.damageBoost,
    elementalDamage: modifiers.elementalDamage,
    resistance: 0 + modifiers.damageResistance,
    luck: 1.0,
    dropRate: 100,
    goldBonus: 100,
    xpBonus: 100,
    speed: core.baseSpeed + Math.floor(modifiers.haste / 10),
  };
}

export function createEmptyCoreStats(): CoreStats {
  return {
    weaponDamageMin: 0, weaponDamageMax: 0,
    classEnchant: null, weaponEnchant: null, helmetEnchant: null, capeEnchant: null,
    baseHp: 100, baseMana: 50, baseAttack: 10, baseDefense: 10,
    baseMagic: 10, baseMagicDefense: 10, baseSpeed: 10,
  };
}

export function createEmptyModifierStats(): ModifierStats {
  return {
    damageBoost: 0, damageResistance: 0,
    physicalBoost: 0, magicalBoost: 0, elementalDamage: 0,
    physicalResist: 0, magicalResist: 0,
    healingBoost: 0, healingReceived: 0,
    dotBoost: 0, dotResistance: 0,
    armorPenetration: 0, magicPenetration: 0,
    trueDamage: 0, lifeSteal: 0, manaSteal: 0,
    cooldownReduction: 0, haste: 0, manaCostReduction: 0,
  };
}

export function createEmptyCombatStats(): CombatStats {
  return {
    attackPower: 10, spellPower: 10,
    criticalChance: 5, criticalMultiplier: 150,
    hitChance: 95, dodgeChance: 2,
    attackSpeed: 1000, cooldownReductionTotal: 0,
    manaRegen: 5, healthRegen: 0,
    maxHp: 100, maxMana: 50,
    threat: 100, aggro: 100,
    pvpDamage: 100, pveDamage: 100,
    bossDamage: 100, eliteDamage: 100,
    elementalDamage: 0, resistance: 0,
    luck: 1, dropRate: 100, goldBonus: 100, xpBonus: 100,
    speed: 10,
  };
}
