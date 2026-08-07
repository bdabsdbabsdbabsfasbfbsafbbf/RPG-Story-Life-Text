// ===== Fórmula de progressão de encantamentos (espelho do backend) =====
// Mantém os MESMOS valores de backend/src/core/enchantments/enchantmentStats.ts
// para preview instantâneo no formulário. A fonte da verdade é o backend.

export const ENCHANT_MAX_LEVEL = 150;
export const ENCHANT_MIN_LEVEL = 1;

export const ENCHANTMENT_CATEGORIES = [
  "strength",
  "intellect",
  "endurance",
  "dexterity",
  "wisdom",
  "luck",
];

export const GROWTH_PER_RARITY: Record<string, number> = {
  common: 0.01,
  uncommon: 0.015,
  rare: 0.02,
  epic: 0.025,
  legendary: 0.03,
  mythic: 0.04,
};

export const MAIN_STAT_GROWTH_BONUS = 0.02;

export const CORE_STAT_KEYS = ["strength", "intellect", "endurance", "dexterity", "wisdom", "luck"];

export function clampLevel(level: number): number {
  return Math.max(ENCHANT_MIN_LEVEL, Math.min(ENCHANT_MAX_LEVEL, Math.floor(level) || ENCHANT_MIN_LEVEL));
}

export function computeEnchantmentStats(enchantment: {
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
  const level = clampLevel(Number(enchantment.level) || 1);
  const rarity = enchantment.rarity || "common";
  const category = enchantment.category || "strength";
  const base = GROWTH_PER_RARITY[rarity] ?? GROWTH_PER_RARITY.common;
  const growth = (stat: string) => (stat === category ? base + MAIN_STAT_GROWTH_BONUS : base);
  const out: Record<string, number> = {};
  for (const stat of CORE_STAT_KEYS) {
    const v = Number((enchantment as any)[stat]) || 0;
    out[stat] = Math.max(1, Math.round(v * (1 + growth(stat) * (level - ENCHANT_MIN_LEVEL))));
  }
  return out;
}
