import { prisma } from "./database";

// Tipos de boost suportados por Anéis/Colares (configuráveis no admin)
export const BOOST_TYPES = ["defense", "damage", "dropChance", "xp", "gold", "classXp"] as const;
export type BoostType = (typeof BOOST_TYPES)[number];

export const BOOST_TYPE_LABELS: Record<BoostType, string> = {
  defense: "Defesa",
  damage: "Dano Geral",
  dropChance: "Chance de Drop",
  xp: "XP",
  gold: "Gold",
  classXp: "XP de Classe",
};

export const BOOSTER_RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;

export const RARITY_LABELS: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
  mythic: "Mítico",
};

// Valor MÁXIMO do boost por raridade (spec): Comum +5% ... Mítico +30%
export const BOOST_MAX_BY_RARITY: Record<string, number> = {
  common: 5,
  uncommon: 10,
  rare: 15,
  epic: 20,
  legendary: 25,
  mythic: 30,
};

export type BoosterBonuses = Record<BoostType, number>;

export const EMPTY_BOOSTER_BONUSES: BoosterBonuses = {
  defense: 0,
  damage: 0,
  dropChance: 0,
  xp: 0,
  gold: 0,
  classXp: 0,
};

// Soma os valores dos boosters equipados (aceita rows de UserBooster com .booster incluso)
export function sumBoosterBonuses(owned: { booster: { boostType: string; boostValue: number } }[]): BoosterBonuses {
  const bonuses = { ...EMPTY_BOOSTER_BONUSES };
  for (const ub of owned) {
    const t = ub.booster.boostType as BoostType;
    if (t in bonuses) bonuses[t] += Number(ub.booster.boostValue) || 0;
  }
  return bonuses;
}

// Boosters equipados do usuário (máx. 1 anel + 1 colar)
export async function getEquippedBoosterBonuses(userId: string): Promise<BoosterBonuses> {
  const owned = await prisma.userBooster.findMany({
    where: { userId, equipped: true, booster: { isActive: true } },
    include: { booster: true },
  });
  return sumBoosterBonuses(owned);
}

export async function getGachaConfig() {
  return prisma.gachaConfig.findUnique({ where: { id: "gacha" } });
}

// Normaliza as chances (JSON) garantindo percentuais positivos
export function normalizeChances(chances: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (chances && typeof chances === "object") {
    for (const [rarity, value] of Object.entries(chances as Record<string, unknown>)) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) out[rarity] = n;
    }
  }
  return out;
}

// Rola uma raridade ponderada pelas chances configuradas
export function rollRarity(chances: unknown): string {
  const normalized = normalizeChances(chances);
  const total = Object.values(normalized).reduce((a, b) => a + b, 0);
  if (total <= 0) return "common";
  let roll = Math.random() * total;
  for (const [rarity, chance] of Object.entries(normalized)) {
    roll -= chance;
    if (roll < 0) return rarity;
  }
  return BOOSTER_RARITIES[0];
}

// Sorteia um booster ativo de determinada raridade (null se não houver catálogo)
export async function rollBooster(rarity: string) {
  const pool = await prisma.booster.findMany({ where: { rarity, isActive: true } });
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
