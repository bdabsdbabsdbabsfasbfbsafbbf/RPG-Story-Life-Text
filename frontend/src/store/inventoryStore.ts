import { create } from 'zustand';
import type { InventoryItem, EquipmentSlot, EquipmentMap } from '@/types';

interface InventoryStore {
  items: InventoryItem[];
  equipment: EquipmentMap;
  maxSlots: number;
  gold: number;
  setItems: (items: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  equipItem: (item: InventoryItem, slot: EquipmentSlot) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  setEquipment: (equipment: EquipmentMap) => void;
  setMaxSlots: (maxSlots: number) => void;
  setGold: (gold: number) => void;
}

const defaultEquipment: EquipmentMap = {
  weapon: null,
  helmet: null,
  chestplate: null,
  leggings: null,
  boots: null,
  shield: null,
  ring1: null,
  ring2: null,
  amulet: null,
  cape: null,
  gloves: null,
  belt: null,
};

export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  equipment: defaultEquipment,
  maxSlots: 40,
  gold: 0,
  setItems: (items) => set({ items }),
  addItem: (item) =>
    set((state) => {
      if (state.items.length >= state.maxSlots) return state;
      const existing = item.item.stackable ? state.items.find((i) => i.itemId === item.itemId) : undefined;
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i)),
    })),
  equipItem: (item, slot) =>
    set((state) => ({
      equipment: { ...state.equipment, [slot]: item },
      items: state.items.map((i) => (i.id === item.id ? { ...i, isEquipped: true } : i)),
    })),
  unequipItem: (slot) =>
    set((state) => {
      const item = state.equipment[slot];
      if (!item) return state;
      return {
        equipment: { ...state.equipment, [slot]: null },
        items: state.items.map((i) => (i.id === item.id ? { ...i, isEquipped: false } : i)),
      };
    }),
  setEquipment: (equipment) => set({ equipment }),
  setMaxSlots: (maxSlots) => set({ maxSlots }),
  setGold: (gold) => set({ gold }),
}));
