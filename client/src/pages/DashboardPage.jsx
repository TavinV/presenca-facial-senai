import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';


export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                    Sistema de Presença Facial - SENAI
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card de boas-vindas */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Olá, {user?.name}!
                    </h2>
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            <span className="font-medium">E-mail:</span> {user?.email}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Função:</span>{' '}
                            {user?.role === 'coordenador' ? 'Coordenador' : 'Professor'}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">ID:</span> {user?.id?.substring(0, 8)}...
                        </p>
                    </div>
                </div>

                {/* Card de status do sistema */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Status do Sistema
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Sessões ativas</span>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                0
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Turmas cadastradas</span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Alunos cadastrados</span>
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card de ações rápidas */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Ações Rápidas
                    </h2>
                    <div className="space-y-3">
                        <button className="w-full text-left p-3 bg-senai-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Abrir nova sessão
                        </button>
                        <button className="w-full text-left p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            Ver turmas
                        </button>
                        <button className="w-full text-left p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            Registrar presença manual
                        </button>
                    </div>
                </div>
            </div>

            {/* Mensagem de desenvolvimento */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Este é um dashboard temporário. O dashboard completo com estatísticas em tempo real será implementado em breve.
                </p>
            </div>
        </Layout>
    );
}