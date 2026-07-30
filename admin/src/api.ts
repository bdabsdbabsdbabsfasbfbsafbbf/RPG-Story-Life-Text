import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default api;

export const adminApi = {
  // Classes
  classes: {
    list: () => api.get("/admin/classes"),
    create: (data: any) => api.post("/admin/classes", data),
    update: (id: string, data: any) => api.put(`/admin/classes/${id}`, data),
    delete: (id: string) => api.delete(`/admin/classes/${id}`),
  },
  // Items
  items: {
    list: () => api.get("/admin/items"),
    create: (data: any) => api.post("/admin/items", data),
    update: (id: string, data: any) => api.put(`/admin/items/${id}`, data),
    delete: (id: string) => api.delete(`/admin/items/${id}`),
  },
  // Monsters
  monsters: {
    list: () => api.get("/admin/monsters"),
    create: (data: any) => api.post("/admin/monsters", data),
    update: (id: string, data: any) => api.put(`/admin/monsters/${id}`, data),
    delete: (id: string) => api.delete(`/admin/monsters/${id}`),
  },
  // Maps
  maps: {
    list: () => api.get("/admin/maps"),
    create: (data: any) => api.post("/admin/maps", data),
    update: (id: string, data: any) => api.put(`/admin/maps/${id}`, data),
    delete: (id: string) => api.delete(`/admin/maps/${id}`),
  },
  // Quests
  quests: {
    list: () => api.get("/admin/quests"),
    create: (data: any) => api.post("/admin/quests", data),
    update: (id: string, data: any) => api.put(`/admin/quests/${id}`, data),
    delete: (id: string) => api.delete(`/admin/quests/${id}`),
  },
  // Skills
  skills: {
    list: (classId: string) => api.get(`/admin/classes/${classId}/skills`),
    create: (classId: string, data: any) => api.post(`/admin/classes/${classId}/skills`, data),
    update: (id: string, data: any) => api.put(`/admin/skills/${id}`, data),
    delete: (id: string) => api.delete(`/admin/skills/${id}`),
  },
  // Buffs
  buffs: {
    list: () => api.get("/admin/buffs"),
    create: (data: any) => api.post("/admin/buffs", data),
    update: (id: string, data: any) => api.put(`/admin/buffs/${id}`, data),
    delete: (id: string) => api.delete(`/admin/buffs/${id}`),
  },
  // Stats
  stats: () => api.get("/admin/stats"),
  // Users
  users: {
    list: () => api.get("/admin/users"),
    update: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  },
};
