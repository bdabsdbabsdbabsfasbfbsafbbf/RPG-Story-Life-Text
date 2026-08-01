import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = new URL("./login", window.location.href).href;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const adminApi = {
  auth: {
    login: (username: string, password: string) =>
      api.post("/admin/auth/login", { username, password }),
    me: () => api.get("/admin/auth/me"),
  },
  settings: {
    guild: () => api.get("/admin/settings/guild"),
    updateGuild: (data: any) => api.put("/admin/settings/guild", data),
  },
  classes: {
    list: () => api.get("/admin/classes"),
    create: (data: any) => api.post("/admin/classes", data),
    update: (id: string, data: any) => api.put(`/admin/classes/${id}`, data),
    delete: (id: string) => api.delete(`/admin/classes/${id}`),
  },
  items: {
    list: () => api.get("/admin/items"),
    create: (data: any) => api.post("/admin/items", data),
    update: (id: string, data: any) => api.put(`/admin/items/${id}`, data),
    delete: (id: string) => api.delete(`/admin/items/${id}`),
  },
  monsters: {
    list: () => api.get("/admin/monsters"),
    create: (data: any) => api.post("/admin/monsters", data),
    update: (id: string, data: any) => api.put(`/admin/monsters/${id}`, data),
    delete: (id: string) => api.delete(`/admin/monsters/${id}`),
  },
  maps: {
    list: () => api.get("/admin/maps"),
    create: (data: any) => api.post("/admin/maps", data),
    update: (id: string, data: any) => api.put(`/admin/maps/${id}`, data),
    delete: (id: string) => api.delete(`/admin/maps/${id}`),
  },
  quests: {
    list: () => api.get("/admin/quests"),
    create: (data: any) => api.post("/admin/quests", data),
    update: (id: string, data: any) => api.put(`/admin/quests/${id}`, data),
    delete: (id: string) => api.delete(`/admin/quests/${id}`),
  },
  skills: {
    list: (classId: string) => api.get(`/admin/classes/${classId}/skills`),
    create: (classId: string, data: any) => api.post(`/admin/classes/${classId}/skills`, data),
    update: (id: string, data: any) => api.put(`/admin/skills/${id}`, data),
    delete: (id: string) => api.delete(`/admin/skills/${id}`),
  },
  buffs: {
    list: () => api.get("/admin/buffs"),
    create: (data: any) => api.post("/admin/buffs", data),
    update: (id: string, data: any) => api.put(`/admin/buffs/${id}`, data),
    delete: (id: string) => api.delete(`/admin/buffs/${id}`),
  },
  races: {
    list: () => api.get("/admin/races"),
    create: (data: any) => api.post("/admin/races", data),
    update: (id: string, data: any) => api.put(`/admin/races/${id}`, data),
    delete: (id: string) => api.delete(`/admin/races/${id}`),
  },
  traits: {
    list: () => api.get("/admin/traits"),
    create: (data: any) => api.post("/admin/traits", data),
    update: (id: string, data: any) => api.put(`/admin/traits/${id}`, data),
    delete: (id: string) => api.delete(`/admin/traits/${id}`),
  },
  stats: () => api.get("/admin/stats"),
  users: {
    list: () => api.get("/admin/users"),
    get: (id: string) => api.get(`/admin/users/${id}`),
    update: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
    delete: (id: string) => api.delete(`/admin/users/${id}`),
    characters: {
      update: (userId: string, characterId: string, data: any) =>
        api.put(`/admin/users/${userId}/characters/${characterId}`, data),
    },
    inventory: {
      list: (userId: string) => api.get(`/admin/users/${userId}/inventory`),
      add: (userId: string, data: any) => api.post(`/admin/users/${userId}/inventory`, data),
      remove: (userId: string, inventoryId: string) =>
        api.delete(`/admin/users/${userId}/inventory/${inventoryId}`),
    },
  },
  codes: {
    list: () => api.get("/admin/codes"),
    create: (data: any) => api.post("/admin/codes", data),
    update: (id: string, data: any) => api.put(`/admin/codes/${id}`, data),
    delete: (id: string) => api.delete(`/admin/codes/${id}`),
  },
};
