import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes';

export default function ProtectedRoute({
    children,
    requireCoordinator = false,
    redirectTo = ROUTES.PUBLIC.LOGIN
}) {
    const { isAuthenticated, isCoordinator, loading } = useAuth();

    // Mostrar loading enquanto verifica autenticação
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-senai-red mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // Se requer coordenador mas o usuário não é coordenador
    if (requireCoordinator && !isCoordinator) {
        return <Navigate to={ROUTES.PRIVATE.DASHBOARD} replace />;
    }

    // Se passar em todas as verificações, renderiza o children
    return children;
}