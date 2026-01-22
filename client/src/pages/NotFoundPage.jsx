import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes';
import { FiHome, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

export default function NotFoundPage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center">
                {/* Ícone de alerta */}
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
                        <FiAlertTriangle className="w-10 h-10 text-senai-red" />
                    </div>
                </div>

                {/* Título */}
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    404
                </h1>

                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Página não encontrada
                </h2>

                {/* Mensagem */}
                <p className="text-gray-600 mb-8">
                    A página que você está procurando não está disponível no momento.
                </p>

                {/* Ações */}
                <div className="space-y-3">
                    <Link
                        to={isAuthenticated ? ROUTES.PRIVATE.DASHBOARD : ROUTES.PUBLIC.LOGIN}
                        className="block w-full px-4 py-3 bg-senai-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                        <FiHome className="mr-2" />
                        {isAuthenticated ? 'Voltar ao Dashboard' : 'Ir para Login'}
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="block w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                        <FiArrowLeft className="mr-2" />
                        Voltar para página anterior
                    </button>
                </div>

                {/* Informações de contato */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Precisa de ajuda? Entre em contato com o suporte técnico.
                    </p>
                </div>
            </div>
        </div>
    );
}