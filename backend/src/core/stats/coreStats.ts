export const CORE_STAT_KEYS = [
  "strength",
  "intellect",
  "endurance",
  "dexterity",
  "wisdom",
  "luck",
] as const;

export type CoreStats = Record<(typeof CORE_STAT_KEYS)[number], number>;

export function emptyCoreStats(): CoreStats {
  return { strength: 0, intellect: 0, endurance: 0, dexterity: 0, wisdom: 0, luck: 0 };
}

// Soma core stats de itens e encantamentos
export function sumCoreStats(sources: Array<Partial<CoreStats> | null | undefined>): CoreStats {
  const total = emptyCoreStats();
  for (const src of sources) {
    if (!src) continue;
    for (const key of CORE_STAT_KEYS) {
      total[key] += Number(src[key]) || 0;
    }
  }
  return total;
}
