import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = storage.get('token');

        if (token) {
            try {
                // Decodificar token JWT simples
                // Fazendo requisição para obter dados do usuário pode ser uma alternativa mais segura
                const response = await authService.getCurrentUser();
                if (response.success && response.data) {
                    const payload = response.data;
                    setUser({
                        id: payload._id,
                        name: payload.name,
                        role: payload.role,
                        email: payload.email || '',
                    });
                } else {
                    throw new Error('Token inválido');
                }
            } catch (error) {
                console.error('Erro ao decodificar token:', error);
                storage.remove('token');
            }
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (email, password) => {
        try {
            const response = await authService.login(email, password);

            // A API retorna { success: true, message: "", data: {token: "token", user: {...}} }
            if (response.success && response.data) {
                const token = response.data.token;
                storage.set('token', token);

                // Decodificar token JWT
                try {
                    const payload = response.data.user;
                    const userData = {
                        id: payload._id,
                        name: payload.name,
                        role: payload.role,
                        email: payload.email || email,
                    };

                    setUser(userData);
                    return { success: true, user: userData };
                } catch (decodeError) {
                    console.error('Erro ao decodificar token:', decodeError);
                    return { success: false, message: 'Token inválido' };
                }
            }

            return {
                success: false,
                message: response.message || 'Credenciais inválidas'
            };

        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                message: error.message || 'Erro ao conectar com o servidor'
            };
        }
    }, []);

    const logout = useCallback(() => {
        storage.remove('token');
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isCoordinator: user?.role === 'coordenador',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar o contexto
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}