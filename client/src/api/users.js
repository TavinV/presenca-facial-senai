import api from "../services/api";

export const usersApi = {
    // GET - Listar todos os usuários
    getAll: () => api.get('/users'),

    // GET - Obter usuário por ID
    getById: (id) => api.get(`/users/${id}`),

    // POST - Criar usuário    
    create: (userData) => api.post('/users', userData),

    // PATCH - Atualizar usuário
    update: (id, userData) => api.patch(`/users/${id}`, userData),

    // DELETE - Excluir usuário
    delete: (id) => api.delete(`/users/${id}`),
    // PATCH - Ativar usuário
    activate: (id) => api.patch(`/users/${id}/activate`),
    // PATCH - Desativar usuário
    deactivate: (id) => api.patch(`/users/${id}/deactivate`),
}