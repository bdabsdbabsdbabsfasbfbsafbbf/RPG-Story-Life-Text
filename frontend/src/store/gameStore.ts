import { create } from "zustand";
import { Character, Map, InventoryItem, ChatMessage, CombatUpdate } from "../types";

interface GameState {
  selectedCharacter: Character | null;
  currentMap: Map | null;
  inventory: InventoryItem[];
  combat: CombatUpdate | null;
  chatMessages: ChatMessage[];
  chatChannel: string;
  isLoading: boolean;

  setCharacter: (character: Character | null) => void;
  setCurrentMap: (map: Map | null) => void;
  setInventory: (items: InventoryItem[]) => void;
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (id: string) => void;
  setCombat: (combat: CombatUpdate | null) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatChannel: (channel: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  selectedCharacter: null,
  currentMap: null,
  inventory: [],
  combat: null,
  chatMessages: [],
  chatChannel: "global",
  isLoading: false,

  setCharacter: (character) => set({ selectedCharacter: character }),
  setCurrentMap: (map) => set({ currentMap: map }),
  setInventory: (items) => set({ inventory: items }),
  addInventoryItem: (item) =>
    set((state) => ({ inventory: [...state.inventory, item] })),
  removeInventoryItem: (id) =>
    set((state) => ({ inventory: state.inventory.filter((i) => i.id !== id) })),
  setCombat: (combat) => set({ combat }),
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-199), msg],
    })),
  setChatChannel: (channel) => set({ chatChannel: channel }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
