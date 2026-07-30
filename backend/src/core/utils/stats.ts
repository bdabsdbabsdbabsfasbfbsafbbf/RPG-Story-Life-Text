export interface StatBlock {
  maxHp: number;
  maxMana: number;
  maxStamina: number;
  attack: number;
  defense: number;
  magic: number;
  magicDefense: number;
  criticalChance: number;
  criticalDamage: number;
  armorPenetration: number;
  magicPenetration: number;
  lifeSteal: number;
  manaSteal: number;
  attackSpeed: number;
  cooldownReduction: number;
  dodge: number;
  accuracy: number;
  block: number;
  healingPower: number;
  healingReceived: number;
  luck: number;
  dropRate: number;
  goldBonus: number;
  xpBonus: number;
  bossDamage: number;
  eliteDamage: number;
  pvpDamage: number;
  pveDamage: number;
  elementalDamage: number;
  resistance: number;
  speed: number;
}

export function createEmptyStats(): StatBlock {
  return {
    maxHp: 0, maxMana: 0, maxStamina: 0,
    attack: 0, defense: 0, magic: 0, magicDefense: 0,
    criticalChance: 0, criticalDamage: 0,
    armorPenetration: 0, magicPenetration: 0,
    lifeSteal: 0, manaSteal: 0,
    attackSpeed: 0, cooldownReduction: 0,
    dodge: 0, accuracy: 0, block: 0,
    healingPower: 0, healingReceived: 0,
    luck: 0, dropRate: 0, goldBonus: 0, xpBonus: 0,
    bossDamage: 0, eliteDamage: 0, pvpDamage: 0, pveDamage: 0,
    elementalDamage: 0, resistance: 0, speed: 0,
  };
}

export function combineStats(...stats: Partial<StatBlock>[]): StatBlock {
  const result = createEmptyStats();
  for (const s of stats) {
    for (const key of Object.keys(result) as (keyof StatBlock)[]) {
      result[key] += s[key] || 0;
    }
  }
  return result;
}

export function applyStatPercentiles(base: StatBlock, percentiles: Partial<Record<keyof StatBlock, number>>): StatBlock {
  const result = { ...base };
  for (const key of Object.keys(percentiles) as (keyof StatBlock)[]) {
    if (percentiles[key] !== undefined) {
      (result as any)[key] += Math.floor((base[key] * percentiles[key]!) / 100);
    }
  }
  return result;
}
