import { create } from 'zustand';
import type { Player, PlayerStats } from '@/types';

interface PlayerStore {
  player: Player | null;
  setPlayer: (player: Player) => void;
  updateStats: (stats: Partial<PlayerStats>) => void;
  updateResource: (resource: 'hp' | 'mana' | 'stamina', value: number) => void;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  addDiamonds: (amount: number) => void;
  levelUp: () => void;
  setLocation: (location: string) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  updateStats: (stats) =>
    set((state) => ({
      player: state.player ? { ...state.player, stats: { ...state.player.stats, ...stats } } : null,
    })),
  updateResource: (resource, value) =>
    set((state) => ({
      player: state.player ? { ...state.player, [resource]: Math.max(0, Math.min(state.player[resource], value)) } : null,
    })),
  addXp: (amount) =>
    set((state) => ({
      player: state.player ? { ...state.player, xp: state.player.xp + amount } : null,
    })),
  addGold: (amount) =>
    set((state) => ({
      player: state.player ? { ...state.player, gold: state.player.gold + amount } : null,
    })),
  addDiamonds: (amount) =>
    set((state) => ({
      player: state.player ? { ...state.player, diamonds: state.player.diamonds + amount } : null,
    })),
  levelUp: () =>
    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            level: state.player.level + 1,
            xp: 0,
            xpToNext: Math.floor(state.player.xpToNext * 1.5),
          }
        : null,
    })),
  setLocation: (location) =>
    set((state) => ({
      player: state.player ? { ...state.player, location } : null,
    })),
}));
