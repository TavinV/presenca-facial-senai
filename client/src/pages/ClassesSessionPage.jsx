import Layout from "../components/layout/Layout";
import Search from "../components/ui/Search";
import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import useClassesSessions from "../hooks/useClassesSessions";
import { useUsers } from "../hooks/useUsers";
import Toast from "../components/ui/Toast";
import Modal from "../components/ui/Modal";
import useModal from "../hooks/useModal";
import useClasses from "../hooks/useClasses";
import { useAuth } from "../context/AuthContext";
import {
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUsers,
  FaClock,
  FaDoorOpen,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLock,
  FaLockOpen,
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaListAlt,
  FaBuilding,
  FaArrowLeft,
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function ClassesSession() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isByTeacher = pathname.includes("/teacher/");

  const {
    sessions,
    loadByClass,
    loadByTeacher,
    deleteSession,
    closeSession,
    loading,
    error,
  } = useClassesSessions();

  const [filtered, setFiltered] = useState([]);

  const { teachers, loadUsers } = useUsers();
  const { classes, loadClasses, loadMyClasses } = useClasses();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!id) {
      // Only professors should see their own classes; others load full lists
      if (user?.role === "professor") {
        // load classes assigned to the logged-in professor
        loadMyClasses();
      } else {
        // coordinators and others load full lists
        loadUsers();
        loadClasses();
      }
    }
  }, [id, loadUsers, loadClasses, loadMyClasses, user?.role, authLoading]);

  useEffect(() => {
    if (!id) return;

    // If route is for teacher sessions, prevent professors from loading other teachers' data
    if (isByTeacher) {
      if (user?.role === "professor" && user.id !== id) {
        // Not allowed to view other professors' sessions - clear list and show message
        setFiltered([]);
        // eslint-disable-next-line react-hooks/immutability
        setMessage({
          text: "Acesso negado a sessões de outros professores.",
          type: "error",
        });
        return;
      }

      loadByTeacher(id);
    } else {
      loadByClass(id);
    }
  }, [id, isByTeacher, loadByClass, loadByTeacher, user?.id, user?.role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltered(sessions || []);
  }, [sessions]);

  function handleSearch({ search }) {
    let res = sessions || [];
    if (search) {
      res = res.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (s.notes || "").toLowerCase().includes(search.toLowerCase()),
      );
    }
    setFiltered(res);
  }

  const [message, setMessage] = useState({ text: "", type: "" });
  const { modalConfig, showModal, hideModal, handleConfirm } = useModal();

  async function handleDelete(sessionId) {
    showModal({
      title: "Excluir Sessão",
      message:
        "Tem certeza que deseja excluir esta sessão?\nEsta ação não pode ser desfeita.",
      type: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        await deleteSession(sessionId);
      },
    });
  }

  async function handleClose(sessionId) {
    try {
      const res = await closeSession(sessionId);
      if (res?.success) {
        // Refresh the sessions list to show updated status
        if (isByTeacher) {
          await loadByTeacher(id);
        } else {
          await loadByClass(id);
        }
      } else {
        setMessage({
          text: res?.message || "Erro ao fechar/reabrir sessão",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({
        text: err.message || "Erro ao fechar/reabrir sessão",
        type: "error",
      });
    }
  }

  const handleEdit = (id) => {

    navigate(`/class-sessions/${id}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Cabeçalho Geral */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaCalendarAlt className="text-red-600 mr-3" />
            Aulas
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie as aula por turma ou professor
          </p>
        </div>

        {!id && (
          <>
            {/* Seção de Turmas */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaUsers className="text-blue-600 mr-2" />
                  Aulas por Turma
                </h2>
                <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {
                      classes.length
                  }{" "}
                  turma(s)
                </span>
              </div>

              {classes.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                  <FaUsers className="text-gray-300 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma turma cadastrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((cls) => (
                    <Link
                      key={cls._id}
                      to={`/class-sessions/class/${cls._id}`}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group"
                    >
                      <div className="p-6">
                        <div className="flex items-start mb-4">
                          <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <FaBuilding className="text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {cls.course || "Turma sem nome"}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {cls.code || "Sem código"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaClock className="mr-2" />
                          <span>Clique para ver Aulas</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Seção de Professores (visible only to coordinators) */}
            {(user?.role === "coordinator" || user?.role === "coordenador") && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaChalkboardTeacher className="text-green-600 mr-2" />
                    Aulas por Professor
                  </h2>
                  <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {teachers.length} professores
                  </span>
                </div>

                {teachers.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <FaChalkboardTeacher className="text-gray-300 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum professor cadastrado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map((t) => (
                      <Link
                        key={t._id}
                        to={`/class-sessions/teacher/${t._id}`}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group"
                      >
                        <div className="p-6">
                          <div className="flex items-start mb-4">
                            <div className="bg-green-100 p-3 rounded-lg mr-4">
                              <FaChalkboardTeacher className="text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">
                                {t.name || "Professor sem nome"}
                              </h3>
                              <p className="text-gray-600 text-sm mt-1 truncate">
                                {t.email || "Sem e-mail"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FaCalendarAlt className="mr-2" />
                            <span>Clique para ver Aulas</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {id && (
          <>
            {/* Cabeçalho Detalhado */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
                  >
                    <FaArrowLeft className="mr-2" />
                    Voltar
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaListAlt className="text-red-600 mr-3" />
                    {isByTeacher ? "Aulas do Professor" : "Aulas da Turma"}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {isByTeacher
                      ? "Visualize e gerencie todas as aulas deste professor"
                      : "Visualize e gerencie todas as aulas desta turma"}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {sessions?.length || 0} Aulas
                  </span>
                  <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {sessions?.filter((s) => !s.isClosed).length || 0} abertas
                  </span>
                </div>
              </div>

              {/* Barra de Ações */}
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="w-full sm:w-auto">
                    <Search
                      placeholder="Buscar aulas por título ou notas..."
                      onChange={handleSearch}
                    />
                  </div>
                  {!isByTeacher && (
                    <Link
                      to={`/class-sessions/?classId=${id}`}
                      className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <FaPlus className="mr-2" />
                      Nova Aula
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaCalendarAlt className="text-red-600 mr-3" />
                  Lista de Aulas
                  <span className="ml-3 bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                    {filtered.length} registros
                  </span>
                </h3>
              </div>

              <div className="p-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4">
                      <FaSpinner className="hidden" />
                    </div>
                    <p className="text-gray-600">Carregando sessões...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="mr-3 text-red-600" />
                      <div>
                        <p className="font-bold">Erro ao carregar sessões</p>
                        <p className="text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="text-gray-300 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Nenhuma sessão encontrada
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {isByTeacher
                        ? "Este professor não possui sessões cadastradas"
                        : "Esta turma não possui sessões cadastradas"}
                    </p>
                    {!isByTeacher && (
                      <Link
                        to={`/class-sessions/?classId=${id}`}
                        className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FaPlus className="mr-2" />
                        Criar Primeira Aula
                      </Link>
                    )}
                  </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filtered.map((s) => {
                      const sessionId = s._id || s.id;
                      let endsAt = s?.endsAt
                      let formatedEndTime = null ;
                      if (endsAt){
                           formatedEndTime = new Date(endsAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                      };
                     
                      
                      const isClosed = s.status == "closed";
                      
                      return (
                        <div
                          key={sessionId}
                          onClick={() => {
                            handleEdit(sessionId);
                          }}
                          className={`border border-gray-200 rounded-xl p-6 transition-all duration-200
                          ${
                            isClosed
                              ? "bg-gray-100 text-gray-500 opacity-80 pointer-none:"
                              : "bg-white hover:shadow-md cursor-pointer hover:scale-[1.02]"
                          }
                        `}
                        >
                          {/* Cabeçalho da Sessão */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg mb-2">
                                {`${s.name} - ${s.subjectCode} ` || "Sessão sem título"}
                              </h3>
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    isClosed
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {isClosed ? (
                                    <>
                                      <FaLock className="mr-1" />
                                      Fechada
                                    </>
                                  ) : (
                                    <>
                                      <FaLockOpen className="mr-1" />
                                      Aberta
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Informações da Sessão */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-700">
                              <FaCalendarAlt className="text-gray-400 mr-3 w-5" />
                              <div>
                                <span className="text-sm text-gray-500">
                                  Data
                                </span>
                                <p className="font-medium">
                                  {s.date
                                    ? new Date(s.date).toLocaleString("pt-BR")
                                    : "-"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <FaClock className="text-gray-400 mr-3 w-5" />
                              <div>
                                <span className="text-sm text-gray-500">
                                  Horário de termino
                                </span>
                                <p className="font-medium">
                                  {formatedEndTime || "-"}
                                </p>
                              </div>
                            </div>
                            {s.notes && (
                              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <strong>Notas:</strong> {s.notes}
                              </div>
                            )}
                          </div>

                          {/* Rodapé com Ações */}
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                            {!isClosed && (
                              <>
                                <button
                                  onClick={() => handleDelete(sessionId)}
                                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex-1 min-w-[120px] justify-center"
                                >
                                  <FaTrash className="mr-2" />
                                  Excluir
                                </button>

                                <button
                                  onClick={() => handleClose(sessionId)}
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex-1 min-w-[120px] justify-center"
                                >
                                  <FaLock className="mr-2" />
                                  Fechar
                                </button>
                              </>
                            )}

                            {isClosed && (
                              <button
                                onClick={() =>
                                  navigate(
                                    `/reports/class-session/${sessionId}`,
                                  )
                                }
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg w-full justify-center"
                              >
                                <FaChartBar className="mr-2" />
                                Ver Relatório
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Toast
        message={message.text}
        type={message.type}
        onClose={() => {
          setMessage({ text: "", type: "" });
        }}
      />
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onConfirm={handleConfirm}
        showCancel={modalConfig.showCancel}
        showConfirm={modalConfig.showConfirm}
      />
    </Layout>
  );
}
