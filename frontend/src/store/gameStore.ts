import { create } from "zustand";
import { Character, ChatMessage } from "../types";

interface GameState {
  selectedCharacter: Character | null;
  inCombat: boolean;
  chatMessages: ChatMessage[];
  chatChannel: string;

  setCharacter: (character: Character | null) => void;
  setInCombat: (inCombat: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatChannel: (channel: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  selectedCharacter: null,
  inCombat: false,
  chatMessages: [],
  chatChannel: "global",

  setCharacter: (character) => set({ selectedCharacter: character }),
  setInCombat: (inCombat) => set({ inCombat }),
  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-199), msg],
    })),
  setChatChannel: (channel) => set({ chatChannel: channel }),
}));
