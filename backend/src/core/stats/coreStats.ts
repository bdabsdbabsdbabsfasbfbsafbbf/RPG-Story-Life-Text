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

// Conversão centralizada de Core Stats -> atributos derivados.
// Ajuste os pesos aqui e todos os equipamentos/encantamentos do jogo seguem a mudança.
export const CORE_CONVERSION: Record<string, Partial<CoreStats>> = {
  attack: { strength: 1, intellect: 0.25 },
  magic: { intellect: 1, strength: 0.25 },
  hp: { endurance: 10 },
  defense: { endurance: 0.5, strength: 0.25 },
  mana: { wisdom: 5, intellect: 1 },
  magicDefense: { wisdom: 0.5, intellect: 0.25 },
  speed: { dexterity: 0.5 },
  critChance: { dexterity: 0.1, luck: 0.05 },
  dodge: { dexterity: 0.05, luck: 0.05 },
};

export function coreToDerived(core: CoreStats): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [stat, weights] of Object.entries(CORE_CONVERSION)) {
    let total = 0;
    for (const [key, w] of Object.entries(weights)) {
      total += (core[key as keyof CoreStats] ?? 0) * (w as number);
    }
    out[stat] = total;
  }
  return out;
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
