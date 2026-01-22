import api from "../services/api";

export const totemsApi = {
    getAll: () => api.get("/totems"),

    getById: (id) => api.get(`/totems/${id}`),

    create: (totemData) => api.post("/totems", totemData),

    update: (id, totemData) => api.patch(`/totems/${id}`, totemData),

    toggleStatus: (id) => api.patch(`/totems/${id}/toggle-status`),

    getApiKey: (id) => api.get(`/totems/${id}/api-key`),

    delete: (id) => api.delete(`/totems/${id}`),

    regenerateApiKey: (id) => api.post(`/totems/${id}/regenerate-api-key`),
}