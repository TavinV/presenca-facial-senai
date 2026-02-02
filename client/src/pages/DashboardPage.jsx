import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import useClassesSessions from '../hooks/useClassesSessions';
import useClasses from '../hooks/useClasses';
import {useUsers} from '../hooks/useUsers';
import Loading from '../components/ui/Loading';
import Toast from '../components/ui/Toast';
import {
    FaChalkboardTeacher,
    FaUserGraduate,
    FaCalendarAlt,
    FaClock,
    FaEnvelope,
    FaBolt,
    FaInfoCircle,
    FaDoorOpen,
    FaChartLine,
    FaPlus,
    FaUsers,
    FaCalendarPlus,
    FaClipboardCheck,
    FaGraduationCap,
    FaBuilding,
    FaBookOpen,
    FaUserFriends,
    FaChartPie,
    FaBell,
    FaCalendarWeek,
    FaCheckCircle,
    FaExclamationCircle,
    FaEye,
    FaFileAlt,
    FaArrowRight,
    FaCog,
    FaSearch,
} from 'react-icons/fa';

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Hooks para dados
    const { sessions, loadByTeacher, loadClasses, loading: sessionsLoading } = useClassesSessions();
    const { classes, loadClasses: loadAllClasses, loading: classesLoading } = useClasses();
    const { teachers, loadUsers, loading: usersLoading } = useUsers();

    // Estados
    const [stats, setStats] = useState({
        totalSessions: 0,
        activeSessions: 0,
        closedSessions: 0,
        totalClasses: 0,
        totalTeachers: 0,
        totalStudents: 0,
        upcomingSessions: 0,
    });
    const [recentSessions, setRecentSessions] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);

    // Carregar dados
    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Se for professor, carrega apenas suas sessões
                if (user?.role === 'professor') {
                    await loadByTeacher(user.id);
                } else {
                    // Coordenador vê tudo
                    await loadClasses();
                }

                await loadAllClasses();
                await loadUsers();

                // Calcular estatísticas
                calculateStats();
                prepareRecentSessions();

            } catch (error) {
                showToast('Erro ao carregar dados do dashboard', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const calculateStats = () => {
        const today = new Date();
        const upcoming = sessions?.filter(s => {
            const sessionDate = new Date(s.date);
            return sessionDate >= today && s.status !== 'closed';
        }) || [];

        setStats({
            totalSessions: sessions?.length || 0,
            activeSessions: sessions?.filter(s => s.status === 'open')?.length || 0,
            closedSessions: sessions?.filter(s => s.status === 'closed')?.length || 0,
            totalClasses: classes?.length || 0,
            totalTeachers: teachers?.length || 0,
            totalStudents: classes.reduce((total, cls) => total + (cls.studentCount || 0), 0),
            upcomingSessions: upcoming.length,
        });
    };

    const prepareRecentSessions = () => {
        const recent = [...(sessions || [])]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        setRecentSessions(recent);
    };

    const showToast = (text, type = 'info') => {
        setMessage({ text, type });
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'new-session':
                navigate('/class-sessions/new');
                break;
            case 'view-classes':
                navigate('/classes');
                break;
            case 'view-sessions':
                navigate('/class-sessions');
                break;
            case 'view-reports':
                navigate('/reports');
                break;
            case 'manage-users':
                navigate('/users');
                break;
            default:
                break;
        }
    };

    const handleViewSession = (sessionId) => {
        navigate(`/class-attendance/${sessionId}`);
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                    <Loading message="Carregando dashboard..." />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
                {/* Cabeçalho do Dashboard */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <FaChartLine className="text-red-600 mr-3" />
                                Dashboard
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Sistema de Controle de Presença - SENAI
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-white rounded-lg shadow-sm px-4 py-2 border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    <span className="text-sm text-gray-600">Sistema Online</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date().toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Card de Boas-vindas com Informações do Usuário */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">
                                    Olá, {user?.name}! 👋
                                </h2>
                                <p className="text-red-100">
                                    Bem-vindo ao sistema de controle de presença do SENAI
                                </p>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <div className="flex items-center">
                                        <FaGraduationCap className="mr-2" />
                                        <span className="font-medium">{user?.role === 'coordenador' ? 'Coordenador' : 'Professor'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaEnvelope className="mr-2" />
                                        <span>{user?.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">
                                            {user?.role === 'professor' ? stats.totalSessions : stats.totalClasses}
                                        </div>
                                        <div className="text-sm">
                                            {user?.role === 'professor' ? 'Aulas Ministradas' : 'Turmas Ativas'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estatísticas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Sessões Ativas */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                <FaCalendarAlt className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.activeSessions}</div>
                                <div className="text-sm text-gray-500">Sessões Ativas</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-green-600 font-medium">
                            {stats.upcomingSessions} próximas aulas
                        </div>
                    </div>

                    {/* Turmas */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg mr-4">
                                <FaUsers className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.totalClasses}</div>
                                <div className="text-sm text-gray-500">Turmas</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                            {stats.totalStudents} alunos no total
                        </div>
                    </div>

                    {/* Professores */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                <FaChalkboardTeacher className="text-purple-600 text-xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.totalTeachers}</div>
                                <div className="text-sm text-gray-500">Professores</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                            Equipe docente ativa
                        </div>
                    </div>

                    {/* Frequência Média */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                <FaClipboardCheck className="text-yellow-600 text-xl" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.closedSessions}</div>
                                <div className="text-sm text-gray-500">Aulas Concluídas</div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-blue-600 font-medium">
                            {stats.totalSessions} aulas no total
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna 1: Ações Rápidas */}
                    <div className="lg:col-span-2">
                        {/* Sessões Recentes */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <FaClock className="text-red-600 mr-3" />
                                    Aulas Recentes
                                </h3>
                                <button
                                    onClick={() => handleQuickAction('view-sessions')}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                                >
                                    Ver todas
                                    <FaArrowRight className="ml-1" />
                                </button>
                            </div>

                            {recentSessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                                    <p className="text-gray-500">Nenhuma aula encontrada</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentSessions.map((session) => (
                                        <div
                                            key={session._id || session.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                                                    {session.name || 'Aula sem título'}
                                                </h4>
                                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                                    <FaCalendarAlt className="mr-2" />
                                                    {new Date(session.date).toLocaleDateString('pt-BR')}
                                                    <FaDoorOpen className="ml-4 mr-2" />
                                                    {session.roomInfo?.name || session.room || 'Sala não definida'}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'open'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {session.status === 'open' ? 'Aberta' : 'Fechada'}
                                                </span>
                                                <button
                                                    onClick={() => handleViewSession(session._id || session.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Visualizar presenças"
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ações Rápidas */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                                <FaBolt className="text-red-600 mr-3" />
                                Ações Rápidas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleQuickAction('new-session')}
                                    className="flex items-center p-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow hover:shadow-lg"
                                >
                                    <FaCalendarPlus className="text-xl mr-3" />
                                    <div className="text-left">
                                        <div className="font-semibold">Nova Aula</div>
                                        <div className="text-sm text-red-100">Criar nova sessão</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleQuickAction('view-classes')}
                                    className="flex items-center p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow hover:shadow-lg"
                                >
                                    <FaBuilding className="text-xl mr-3" />
                                    <div className="text-left">
                                        <div className="font-semibold">Turmas</div>
                                        <div className="text-sm text-blue-100">Gerenciar turmas</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleQuickAction('view-reports')}
                                    className="flex items-center p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow hover:shadow-lg"
                                >
                                    <FaChartPie className="text-xl mr-3" />
                                    <div className="text-left">
                                        <div className="font-semibold">Relatórios</div>
                                        <div className="text-sm text-green-100">Ver estatísticas</div>
                                    </div>
                                </button>

                                {user?.role === 'coordenador' && (
                                    <button
                                        onClick={() => handleQuickAction('manage-users')}
                                        className="flex items-center p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow hover:shadow-lg"
                                    >
                                        <FaUserFriends className="text-xl mr-3" />
                                        <div className="text-left">
                                            <div className="font-semibold">Usuários</div>
                                            <div className="text-sm text-purple-100">Gerenciar acesso</div>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Coluna 2: Informações e Status */}
                    <div>
                        {/* Status do Sistema */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                                <FaCog className="text-red-600 mr-3" />
                                Status do Sistema
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                        <span className="text-gray-700">API de Presença</span>
                                    </div>
                                    <span className="text-green-600 font-medium">Online</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                        <span className="text-gray-700">Banco de Dados</span>
                                    </div>
                                    <span className="text-green-600 font-medium">Conectado</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                        <span className="text-gray-700">Reconhecimento Facial</span>
                                    </div>
                                    <span className="text-green-600 font-medium">Ativo</span>
                                </div>

                            </div>
                        </div>

                        {/* Próximas Aulas (se for professor) */}
                        {user?.role === 'professor' && stats.upcomingSessions > 0 && (
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-lg p-6 border border-red-100">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                                    <FaBell className="text-red-600 mr-3" />
                                    Próximas Aulas
                                </h3>
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-red-600 mb-2">{stats.upcomingSessions}</div>
                                    <p className="text-gray-700 mb-4">aulas agendadas</p>
                                    <button
                                        onClick={() => handleQuickAction('view-sessions')}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Ver Agenda
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Informações Úteis */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                                <FaInfoCircle className="text-blue-600 mr-3" />
                                Informações
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600">Sistema atualizado</span>
                                </li>
                                <li className="flex items-start">
                                    <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600">Backup automático ativo</span>
                                </li>
                                <li className="flex items-start">
                                    <FaExclamationCircle className="text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600">Relatório mensal pendente</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Mensagem Final */}
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                        <FaChartLine className="text-red-600 text-2xl mr-4" />
                        <div>
                            <h4 className="font-bold text-gray-800">Dashboard em Desenvolvimento</h4>
                            <p className="text-gray-600 text-sm mt-1">
                                Novas funcionalidades e gráficos mais detalhados serão adicionados em breve.
                                Em caso de dúvidas, entre em contato com o suporte técnico.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Toast */}
                <Toast
                    message={message.text}
                    type={message.type}
                    onClose={() => setMessage({ text: '', type: '' })}
                />
            </div>
        </Layout>
    );
}