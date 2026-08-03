import { Prisma } from "@prisma/client";
import { GameLimits } from "./gameLimits";

// ===== Nível do personagem (limiares lineares vindos das game limits) =====

export function xpToNextLevel(level: number, limits: GameLimits): number {
  return Math.max(1, Math.floor(level * limits.xpPerLevel));
}

export interface ApplyCharacterXpResult {
  xpGain: number;
  level: number;
  levelUps: number;
  atMaxLevel: boolean;
}

// Aplica XP ao personagem, subindo níveis até o maxLevel.
export async function applyCharacterXp(
  tx: Prisma.TransactionClient,
  characterId: string,
  xpGain: number,
  limits: GameLimits
): Promise<ApplyCharacterXpResult> {
  let levelUps = 0;
  let updated = await tx.character.update({
    where: { id: characterId },
    data: { experience: { increment: xpGain } },
    select: { id: true, level: true, experience: true },
  });
  while (
    updated.level < limits.maxLevel &&
    updated.experience >= BigInt(xpToNextLevel(updated.level, limits))
  ) {
    updated = await tx.character.update({
      where: { id: characterId },
      data: { level: { increment: 1 } },
      select: { id: true, level: true, experience: true },
    });
    levelUps++;
  }
  return { xpGain, level: updated.level, levelUps, atMaxLevel: updated.level >= limits.maxLevel };
}

// ===== Rank de classe (limiar canônico: rank * 150) =====

export function classXpToNextRank(rank: number): number {
  return Math.max(1, Math.floor(rank * 150));
}

export interface ApplyClassXpResult {
  xpGain: number;
  rank: number;
  experience: number;
  rankUps: number;
}

// Aplica XP à classe, subindo ranks automaticamente até maxRank.
export async function applyClassXp(
  tx: Prisma.TransactionClient,
  progressId: string,
  xpGain: number,
  maxRank: number
): Promise<ApplyClassXpResult> {
  const progress = await tx.characterClass.findUnique({
    where: { id: progressId },
    select: { rank: true, experience: true },
  });
  if (!progress) throw new Error("Class progress not found");

  let rank = progress.rank;
  let experience = Number(progress.experience) + Math.max(0, xpGain);
  let rankUps = 0;
  while (rank < maxRank && experience >= classXpToNextRank(rank)) {
    experience -= classXpToNextRank(rank);
    rank++;
    rankUps++;
  }

  const updated = await tx.characterClass.update({
    where: { id: progressId },
    data: { rank, experience: BigInt(experience) },
  });
  return { xpGain, rank: updated.rank, experience: Number(updated.experience), rankUps };
}

// Aplica XP à classe e sobe ranks automaticamente (sem botão) até maxRank.
export async function grantClassXp(
  tx: Prisma.TransactionClient,
  progressId: string,
  xpGain: number
): Promise<{ xpGain: number; experience: number; xpToNext: number; rank: number; rankUps: number }> {
  const progress = await tx.characterClass.findUnique({
    where: { id: progressId },
    select: { rank: true, experience: true, gameClass: { select: { rankMax: true } } },
  });
  if (!progress) return { xpGain, experience: 0, xpToNext: classXpToNextRank(1), rank: 1, rankUps: 0 };

  let rank = progress.rank;
  let experience = Number(progress.experience) + Math.max(0, xpGain);
  let rankUps = 0;
  const maxRank = progress.gameClass?.rankMax ?? 10;
  while (rank < maxRank && experience >= classXpToNextRank(rank)) {
    experience -= classXpToNextRank(rank);
    rank++;
    rankUps++;
  }

  if (rankUps > 0 || xpGain > 0) {
    await tx.characterClass.update({
      where: { id: progressId },
      data: { rank, experience: BigInt(experience) },
    });
  }
  return { xpGain, experience, xpToNext: classXpToNextRank(rank), rank, rankUps };
}

// ===== Ouro (clamp no máximo das game limits) =====

export function clampGold(current: bigint, gain: number, maxGold: bigint): number {
  if (gain <= 0) return 0;
  const target = current + BigInt(Math.floor(gain));
  const clamped = target > maxGold ? maxGold : target;
  return clamped > current ? Number(clamped - current) : 0;
}

// ===== Itens (concede/empilha no inventário por nome do item) =====

export interface ItemGrantEntry {
  itemName: string;
  quantity?: number;
}

export async function addItemsToInventory(
  tx: Prisma.TransactionClient,
  userId: string,
  entries: ItemGrantEntry[]
): Promise<{ granted: { name: string; quantity: number }[] }> {
  const granted: { name: string; quantity: number }[] = [];
  if (!entries || entries.length === 0) return { granted };

  const names = entries
    .map((e) => (typeof e?.itemName === "string" ? e.itemName.trim() : ""))
    .filter(Boolean);
  if (names.length === 0) return { granted };

  const items = await tx.item.findMany({
    where: { name: { in: names }, isActive: true },
  });
  for (const entry of entries) {
    const item = items.find((i) => i.name.toLowerCase() === String(entry.itemName).toLowerCase());
    if (!item) continue;
    const quantity = Math.max(1, Math.floor(Number(entry.quantity) || 1));
    const existing = await tx.inventory.findFirst({
      where: { userId, itemId: item.id, slotIndex: null },
    });
    if (existing) {
      await tx.inventory.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await tx.inventory.create({
        data: { userId, itemId: item.id, quantity },
      });
    }
    granted.push({ name: item.name, quantity });
  }
  return { granted };
}
