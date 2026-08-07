// ===== Fórmula de progressão de encantamentos (fallback do jogo) =====
// Espelho de backend/src/core/enchantments/enchantmentStats.ts.
// O backend já envia `computedStats` nos endpoints; este helper serve de
// fallback caso algum encantamento venha sem o campo calculado.

export const ENCHANT_MAX_LEVEL = 150;
export const ENCHANT_MIN_LEVEL = 1;

const GROWTH_PER_RARITY: Record<string, number> = {
  common: 0.01,
  uncommon: 0.015,
  rare: 0.02,
  epic: 0.025,
  legendary: 0.03,
  mythic: 0.04,
};

const MAIN_STAT_GROWTH_BONUS = 0.02;

export const CORE_STAT_KEYS = ["strength", "intellect", "endurance", "dexterity", "wisdom", "luck"];

export function clampEnchantLevel(level: number): number {
  return Math.max(ENCHANT_MIN_LEVEL, Math.min(ENCHANT_MAX_LEVEL, Math.floor(level) || ENCHANT_MIN_LEVEL));
}

export function enchantmentStats(e: {
  strength?: number;
  intellect?: number;
  endurance?: number;
  dexterity?: number;
  wisdom?: number;
  luck?: number;
  rarity?: string;
  category?: string;
  level?: number;
}): Record<string, number> {
  const level = clampEnchantLevel(Number(e.level) || 1);
  const rarity = e.rarity || "common";
  const category = e.category || "strength";
  const base = GROWTH_PER_RARITY[rarity] ?? GROWTH_PER_RARITY.common;
  const growth = (stat: string) => (stat === category ? base + MAIN_STAT_GROWTH_BONUS : base);
  const out: Record<string, number> = {};
  for (const stat of CORE_STAT_KEYS) {
    const v = Number((e as any)[stat]) || 0;
    out[stat] = Math.max(1, Math.round(v * (1 + growth(stat) * (level - ENCHANT_MIN_LEVEL))));
  }
  return out;
}

/** Stats efetivas do encantamento (usa computedStats do backend se existir). */
export function effectiveEnchantmentStats(e: {
  computedStats?: Record<string, number>;
  strength?: number;
  intellect?: number;
  endurance?: number;
  dexterity?: number;
  wisdom?: number;
  luck?: number;
  rarity?: string;
  category?: string;
  level?: number;
}): Record<string, number> {
  return e?.computedStats ?? enchantmentStats(e ?? {});
}
