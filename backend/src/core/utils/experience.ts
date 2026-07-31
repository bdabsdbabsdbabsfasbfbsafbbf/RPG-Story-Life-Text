const BASE_EXP = 100;
const EXP_GROWTH = 1.15;

export function expForLevel(level: number): number {
  return Math.floor(BASE_EXP * Math.pow(EXP_GROWTH, level - 1));
}

export function totalExpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += expForLevel(i);
  }
  return total;
}

export function levelFromExp(totalExp: number): number {
  let level = 1;
  let expNeeded = 0;
  while (true) {
    expNeeded += expForLevel(level);
    if (totalExp < expNeeded) break;
    level++;
  }
  return level;
}

export function expProgress(totalExp: number): { level: number; currentExp: number; nextLevelExp: number; progress: number } {
  const level = levelFromExp(totalExp);
  const totalForLevel = totalExpForLevel(level);
  const currentExp = totalExp - totalForLevel;
  const nextLevelExp = expForLevel(level);
  const progress = currentExp / nextLevelExp;
  return { level, currentExp, nextLevelExp, progress };
}

export function classExpForRank(rank: number): number {
  return Math.floor(500 * Math.pow(1.3, rank - 1));
}
