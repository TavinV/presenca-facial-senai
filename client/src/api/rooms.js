import api from "../services/api";

export const roomsApi = {
  // GET - Listar todas as salas
  getAll: () => api.get("/rooms"),

  // GET - Buscar sala por ID
  getById: (id) => api.get(`/rooms/${id}`),

  // POST - Criar sala
  create: (roomData) => api.post("/rooms", roomData),

  // PATCH - Atualizar sala
  update: (id, roomData) => api.patch(`/rooms/${id}`, roomData),

  // DELETE - Excluir sala
  delete: (id) => api.delete(`/rooms/${id}`),
};
