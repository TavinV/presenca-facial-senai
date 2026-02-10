import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Loading from "../components/ui/Loading";
import Toast from "../components/ui/Toast";
import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaDoorOpen,
  FaDesktop,
  FaCalendarAlt,
  FaBuilding,
  FaUserFriends,
  FaMapMarkerAlt,
  FaTerminal,
  FaArrowRight,
} from "react-icons/fa";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    // Simular carregamento inicial
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, []);

  const showToast = (text, type = "info") => {
    setMessage({ text, type });
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Links para coordenador
  const coordinatorLinks = [
    {
      id: "classes",
      title: "Turmas",
      description: "Gerenciar turmas e cursos",
      icon: <FaBuilding className="text-2xl" />,
      path: "/classes",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "students",
      title: "Alunos",
      description: "Cadastrar e gerenciar alunos",
      icon: <FaUserGraduate className="text-2xl" />,
      path: "/students",
      color: "from-green-500 to-green-600",
    },
    {
      id: "sessions",
      title: "Aulas",
      description: "Agendar e acompanhar aulas",
      icon: <FaCalendarAlt className="text-2xl" />,
      path: "/class-sessions/list",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "teachers",
      title: "Professores",
      description: "Gerenciar corpo docente",
      icon: <FaChalkboardTeacher className="text-2xl" />,
      path: "/teachers",
      color: "from-red-500 to-red-600",
    },
    {
      id: "rooms",
      title: "Salas",
      description: "Gerenciar salas e laboratórios",
      icon: <FaDoorOpen className="text-2xl" />,
      path: "/rooms",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      id: "totems",
      title: "Totens",
      description: "Configurar totens de presença",
      icon: <FaDesktop className="text-2xl" />,
      path: "/totems",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  // Links para professor
  const teacherLinks = [
    {
      id: "classes",
      title: "Minhas Turmas",
      description: "Visualizar turmas atribuídas",
      icon: <FaBuilding className="text-2xl" />,
      path: "/my-classes",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "students",
      title: "Meus Alunos",
      description: "Ver alunos das minhas turmas",
      icon: <FaUserGraduate className="text-2xl" />,
      path: "/my-students",
      color: "from-green-500 to-green-600",
    },
    {
      id: "sessions",
      title: "Minhas Aulas",
      description: "Acompanhar e criar aulas",
      icon: <FaCalendarAlt className="text-2xl" />,
      path: "/my-sessions",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const links = user?.role === "coordenador" ? coordinatorLinks : teacherLinks;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loading message="Carregando..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Sistema de Controle de Presença - SENAI
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    {user?.role === "coordenador" ? "Coordenador" : "Professor"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Boas-vindas */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">Olá, {user?.name}!</h2>
                <p className="text-red-100 text-sm">
                  Seja bem-vindo ao sistema de controle de presença
                </p>
                <p className="text-red-100 text-sm mt-2">
                  {user?.role === "coordenador"
                    ? "Gerencie turmas, alunos, professores e mais"
                    : "Acompanhe suas turmas e aulas"}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">{links.length}</div>
                    <div className="text-xs">Ações disponíveis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavigation(link.path)}
              className={`
                                bg-white rounded-xl shadow-md p-5 
                                border border-gray-200 hover:shadow-lg 
                                transition-all duration-300 hover:scale-[1.02]
                                text-left group
                            `}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${link.color} text-white`}
                >
                  {link.icon}
                </div>
                <FaArrowRight className="text-gray-300 group-hover:text-red-500 transition-colors" />
              </div>

              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {link.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{link.description}</p>

              <div
                className={`h-1 w-12 rounded-full bg-gradient-to-r ${link.color} transition-all group-hover:w-full duration-300`}
              ></div>
            </button>
          ))}
        </div>

        {/* Mensagem de Rodapé */}
        <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>
              Sistema desenvolvido para o SENAI • Selecione uma das opções acima
              para começar
            </p>
          </div>
        </div>

        {/* Toast */}
        <Toast
          message={message.text}
          type={message.type}
          onClose={() => setMessage({ text: "", type: "" })}
        />
      </div>
    </Layout>
  );
}
