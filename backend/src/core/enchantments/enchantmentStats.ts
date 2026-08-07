// ===== Fórmula de progressão de encantamentos =====
// ÚNICA fonte da verdade dos valores de encantamento:
// - Cada encantamento guarda os valores BASE no nível 1 (colunas strength..luck).
// - Os valores de qualquer nível são calculados por ESTA fórmula — nunca aleatórios.
// - Atributo principal (category) sempre permanece superior aos secundários:
//   o growth do principal é maior que o dos demais, e a base é validada na criação.
// - A Combat Engine usa os valores calculados aqui (o encantamento SUBSTITUI o item).

export const ENCHANT_MAX_LEVEL = 150;
export const ENCHANT_MIN_LEVEL = 1;

export const ENCHANTMENT_CATEGORIES = [
  "strength",
  "intellect",
  "endurance",
  "dexterity",
  "wisdom",
  "luck",
] as const;

export type EnchantmentCategory = (typeof ENCHANTMENT_CATEGORIES)[number];

// Crescimento percentual POR NÍVEL (progressão linear: base * (1 + growth * (level-1)))
// Balanceado por raridade: comum cresce pouco, mítico cresce muito.
export const GROWTH_PER_RARITY: Record<string, number> = {
  common: 0.01,
  uncommon: 0.015,
  rare: 0.02,
  epic: 0.025,
  legendary: 0.03,
  mythic: 0.04,
};

// O atributo principal cresce mais rápido que os secundários (mantém a identidade).
export const MAIN_STAT_GROWTH_BONUS = 0.02;

export const CORE_STATS: (keyof CoreStatValues)[] = [
  "strength",
  "intellect",
  "endurance",
  "dexterity",
  "wisdom",
  "luck",
];

export interface CoreStatValues {
  strength: number;
  intellect: number;
  endurance: number;
  dexterity: number;
  wisdom: number;
  luck: number;
}

export function clampLevel(level: number): number {
  return Math.max(ENCHANT_MIN_LEVEL, Math.min(ENCHANT_MAX_LEVEL, Math.floor(level) || ENCHANT_MIN_LEVEL));
}

export function growthFor(rarity: string, category: string, stat: string): number {
  const base = GROWTH_PER_RARITY[rarity] ?? GROWTH_PER_RARITY.common;
  return stat === category ? base + MAIN_STAT_GROWTH_BONUS : base;
}

/** Valor de UM atributo no nível informado: base * (1 + growth * (level - 1)), mínimo 1. */
export function statAtLevel(base: number, rarity: string, category: string, stat: string, level: number): number {
  const lvl = clampLevel(level);
  const growth = growthFor(rarity, category, stat);
  return Math.max(1, Math.round(base * (1 + growth * (lvl - ENCHANT_MIN_LEVEL))));
}

/** Os 6 atributos calculados no nível do encantamento (base = nível 1). */
export function computeEnchantmentStats(enchantment: {
  strength: number;
  intellect: number;
  endurance: number;
  dexterity: number;
  wisdom: number;
  luck: number;
  rarity: string;
  category: string;
  level: number;
}): CoreStatValues {
  const level = clampLevel(enchantment.level);
  const rarity = enchantment.rarity || "common";
  const category = enchantment.category || "strength";
  const base: CoreStatValues = {
    strength: Number(enchantment.strength) || 0,
    intellect: Number(enchantment.intellect) || 0,
    endurance: Number(enchantment.endurance) || 0,
    dexterity: Number(enchantment.dexterity) || 0,
    wisdom: Number(enchantment.wisdom) || 0,
    luck: Number(enchantment.luck) || 0,
  };
  const out = {} as CoreStatValues;
  for (const stat of CORE_STATS) {
    out[stat] = statAtLevel(base[stat], rarity, category, stat, level);
  }
  return out;
}

/** Projeção de todos os níveis (1-150) para o painel admin. */
export function enchantmentProgression(enchantment: Parameters<typeof computeEnchantmentStats>[0]): Array<{ level: number; stats: CoreStatValues }> {
  const out: Array<{ level: number; stats: CoreStatValues }> = [];
  for (let level = ENCHANT_MIN_LEVEL; level <= ENCHANT_MAX_LEVEL; level++) {
    out.push({ level, stats: computeEnchantmentStats({ ...enchantment, level }) });
  }
  return out;
}

/** Anexa os valores calculados ao objeto serializado (para o jogo e o admin). */
export function withEnchantmentStats<T extends Record<string, any>>(enchantment: T): T & { computedStats: CoreStatValues } {
  return { ...enchantment, computedStats: computeEnchantmentStats(enchantment as any) };
}
