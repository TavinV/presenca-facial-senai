import axios from 'axios';
import { storage } from '../utils/storage';

// URL base da API
const API_URL = 'http://localhost:5000/api';

// Criar instância do axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
    (config) => {
        const token = storage.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar respostas da API
api.interceptors.response.use(
    (response) => {
        // A API retorna { success, message, data }
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            storage.remove('token');
            window.location.href = '/login';
        }

        // Retornar o erro no formato da API
        return Promise.reject(
            error.response?.data || {
                success: false,
                message: error.message || 'Erro de conexão',
                data: null
            }
        );
    }
);

// Serviços de autenticação
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response;
    },

    getCurrentUser: () => {
        return api.get('/users/me');
    }
};

export default api;