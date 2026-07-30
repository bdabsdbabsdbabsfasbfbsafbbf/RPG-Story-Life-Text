import { create } from 'zustand';
import type { Enemy, Buff, Debuff, CombatLogEntry } from '@/types';

interface CombatStore {
  inCombat: boolean;
  enemy: Enemy | null;
  turn: 'player' | 'enemy';
  round: number;
  combatLog: CombatLogEntry[];
  playerBuffs: Buff[];
  playerDebuffs: Debuff[];
  enemyBuffs: Buff[];
  enemyDebuffs: Debuff[];
  skillCooldowns: Record<string, number>;
  ultimateCooldown: number;
  setInCombat: (inCombat: boolean) => void;
  setEnemy: (enemy: Enemy | null) => void;
  setTurn: (turn: 'player' | 'enemy') => void;
  nextRound: () => void;
  addLogEntry: (entry: CombatLogEntry) => void;
  clearLog: () => void;
  addPlayerBuff: (buff: Buff) => void;
  removePlayerBuff: (id: string) => void;
  addPlayerDebuff: (debuff: Debuff) => void;
  removePlayerDebuff: (id: string) => void;
  addEnemyBuff: (buff: Buff) => void;
  removeEnemyBuff: (id: string) => void;
  addEnemyDebuff: (debuff: Debuff) => void;
  removeEnemyDebuff: (id: string) => void;
  setSkillCooldown: (skillId: string, cooldown: number) => void;
  tickCooldowns: (delta: number) => void;
  setUltimateCooldown: (cooldown: number) => void;
  resetCombat: () => void;
}

export const useCombatStore = create<CombatStore>((set) => ({
  inCombat: false,
  enemy: null,
  turn: 'player',
  round: 0,
  combatLog: [],
  playerBuffs: [],
  playerDebuffs: [],
  enemyBuffs: [],
  enemyDebuffs: [],
  skillCooldowns: {},
  ultimateCooldown: 0,
  setInCombat: (inCombat) => set({ inCombat }),
  setEnemy: (enemy) => set({ enemy }),
  setTurn: (turn) => set({ turn }),
  nextRound: () => set((state) => ({ round: state.round + 1 })),
  addLogEntry: (entry) =>
    set((state) => ({ combatLog: [...state.combatLog, entry].slice(-100) })),
  clearLog: () => set({ combatLog: [] }),
  addPlayerBuff: (buff) =>
    set((state) => ({ playerBuffs: [...state.playerBuffs, buff] })),
  removePlayerBuff: (id) =>
    set((state) => ({ playerBuffs: state.playerBuffs.filter((b) => b.id !== id) })),
  addPlayerDebuff: (debuff) =>
    set((state) => ({ playerDebuffs: [...state.playerDebuffs, debuff] })),
  removePlayerDebuff: (id) =>
    set((state) => ({ playerDebuffs: state.playerDebuffs.filter((d) => d.id !== id) })),
  addEnemyBuff: (buff) =>
    set((state) => ({ enemyBuffs: [...state.enemyBuffs, buff] })),
  removeEnemyBuff: (id) =>
    set((state) => ({ enemyBuffs: state.enemyBuffs.filter((b) => b.id !== id) })),
  addEnemyDebuff: (debuff) =>
    set((state) => ({ enemyDebuffs: [...state.enemyDebuffs, debuff] })),
  removeEnemyDebuff: (id) =>
    set((state) => ({ enemyDebuffs: state.enemyDebuffs.filter((d) => d.id !== id) })),
  setSkillCooldown: (skillId, cooldown) =>
    set((state) => ({ skillCooldowns: { ...state.skillCooldowns, [skillId]: cooldown } })),
  tickCooldowns: (delta) =>
    set((state) => {
      const newCooldowns: Record<string, number> = {};
      for (const [id, cd] of Object.entries(state.skillCooldowns)) {
        const newCd = cd - delta;
        if (newCd > 0) newCooldowns[id] = newCd;
      }
      return {
        skillCooldowns: newCooldowns,
        ultimateCooldown: Math.max(0, state.ultimateCooldown - delta),
      };
    }),
  setUltimateCooldown: (cooldown) => set({ ultimateCooldown: cooldown }),
  resetCombat: () =>
    set({
      inCombat: false,
      enemy: null,
      turn: 'player',
      round: 0,
      playerBuffs: [],
      playerDebuffs: [],
      enemyBuffs: [],
      enemyDebuffs: [],
      skillCooldowns: {},
    }),
}));
