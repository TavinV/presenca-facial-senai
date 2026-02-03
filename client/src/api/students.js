import api from '../services/api';
import facialApi from '../services/facialApi';

export const studentsApi = {
    // GET - Listar todos os alunos (aceita query params: page, limit, ...)
    getAll: (params) => api.get('/students', { params }),

    // GET - Listar alunos por turma
    getByClass: (classCode) => api.get(`/students/class/${classCode}`),

    // GET - Obter aluno por ID
    getById: (id) => api.get(`/students/${id}`),

    // POST - Criar aluno
    create: (studentData) => api.post('/students', studentData),

    // PATCH - Atualizar aluno
    update: (id, studentData) => api.patch(`/students/${id}`, studentData),

    // DELETE - Excluir aluno
    delete: (id) => api.delete(`/students/${id}`),

    // PATCH - Atualizar facialId
    updateFacialId: (id, facialEmbedding, nonce) => api.patch(`/students/${id}/face`, { embedding: facialEmbedding, nonce}),

    // Processar imagem facial
    encodeFace: async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await facialApi.post('/encode', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    // Validação de imagem
    validateImage: (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                message: 'Formato de imagem inválido. Use JPG, PNG ou WebP.'
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                message: 'Imagem muito grande. Tamanho máximo: 5MB.'
            };
        }

        return { valid: true };
    }
};