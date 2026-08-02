import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: { username: string; displayName: string; password: string; email?: string }) =>
    api.post("/auth/register", data),
  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () =>
    api.post("/auth/logout"),
  me: () =>
    api.get("/auth/me"),
  updateMe: (data: { displayName?: string; avatar?: string }) =>
    api.put("/auth/me", data),
};

export const charactersApi = {
  index: () => api.get("/characters/index"),
  roll: (type: "race" | "trait") => api.post("/characters/roll", { type }),
  create: (data: { name: string; classId: string; raceId?: string; traitId?: string }) =>
    api.post("/characters", data),
  my: () => api.get("/characters/my"),
  rankUp: () => api.post("/characters/rank-up"),
  tickets: () => api.get("/characters/tickets"),
};

export const redeemApi = {
  redeem: (code: string) => api.post("/redeem", { code }),
};

export const adminApi = {
  getLimits: () => api.get("/admin/settings/limits"),
  updateLimits: (data: { maxLevel: number; maxGold: number; maxDiamonds: number; xpPerLevel: number }) =>
    api.put("/admin/settings/limits", data),
};

export const classesApi = {
  list: () => api.get("/classes"),
  get: (slug: string) => api.get(`/classes/${slug}`),
  getSkills: (slug: string) => api.get(`/classes/${slug}/skills`),
  getPassives: (slug: string) => api.get(`/classes/${slug}/passives`),
  characterClass: (characterId: string) => api.get(`/characters/${characterId}/class`),
};

export const itemsApi = {
  list: (params?: any) => api.get("/items", { params }),
  get: (id: string) => api.get(`/items/${id}`),
};

export const inventoryApi = {
  list: () => api.get("/inventory"),
  equipped: () => api.get("/inventory/equipped"),
  equip: (data: { inventoryId: string; characterId: string }) =>
    api.post("/inventory/equip", data),
  unequip: (data: { inventoryId: string; characterId: string }) =>
    api.post("/inventory/unequip", data),
  remove: (id: string) => api.delete(`/inventory/${id}`),
};

export const mapsApi = {
  list: () => api.get("/maps"),
  get: (slug: string) => api.get(`/maps/${slug}`),
  npcs: (slug: string) => api.get(`/maps/${slug}/npcs`),
  monsters: (slug: string) => api.get(`/maps/${slug}/monsters`),
};

export const monstersApi = {
  get: (id: string) => api.get(`/monsters/${id}`),
};

export const questsApi = {
  list: (params?: any) => api.get("/quests", { params }),
  get: (id: string) => api.get(`/quests/${id}`),
  accept: (id: string) => api.post(`/quests/${id}/accept`),
  progress: () => api.get("/quests/progress"),
  claim: (id: string) => api.post(`/quests/${id}/claim`),
};

export const guildApi = {
  list: () => api.get("/guilds"),
  rankings: () => api.get("/guilds/rankings"),
  get: (id: string) => api.get(`/guilds/${id}`),
  requirements: () => api.get("/guilds/requirements"),
  create: (data: { name: string; tag: string; description: string }) =>
    api.post("/guilds", data),
  join: (id: string) => api.post(`/guilds/${id}/join`),
  leave: (id: string) => api.delete(`/guilds/${id}/leave`),
  mine: () => api.get("/user/guild"),
};

export const marketApi = {
  list: (params?: any) => api.get("/market", { params }),
  mine: () => api.get("/market/my"),
  sell: (data: { inventoryId: string; price: number }) =>
    api.post("/market/sell", data),
  buy: (listingId: string) => api.post(`/market/buy/${listingId}`),
  cancel: (listingId: string) => api.delete(`/market/${listingId}/cancel`),
};

export const npcApi = {
  list: (params?: any) => api.get("/npcs", { params }),
  get: (id: string) => api.get(`/npcs/${id}`),
  shop: (id: string) => api.get(`/npcs/${id}/shop`),
  buy: (id: string, data: { itemId: string; quantity?: number }) =>
    api.post(`/npcs/${id}/buy`, data),
};

export const eventsApi = {
  list: () => api.get("/events"),
  active: () => api.get("/events/active"),
  seasons: () => api.get("/seasons"),
  activeSeason: () => api.get("/seasons/active"),
};
