import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
} from "react-icons/fa";
import useClasses from "../hooks/useClasses";
import { useUsers } from "../hooks/useUsers";
import Search from "../components/ui/Search";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import useModal from "../hooks/useModal";

export default function TeachersPage() {
  const navigate = useNavigate();
  const { classes, loadClasses } = useClasses();

  const {
    users,
    loadUsers,
    deleteUser,
    loading: usersLoading,
    page: hookPage,
    totalPages,
  } = useUsers();

  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 10;
  const [message, setMessage] = useState({ text: "", type: "" });
  const showToast = (text, type = "info") => setMessage({ text, type });
  const { modalConfig, showModal, hideModal, handleConfirm } = useModal();

  function handleSearch({ search, filters }) {
    setSearchTerm(search || "");
    const dept = filters?.department || "all";
    const status = filters?.status || "all";
    setSelectedDepartment(dept);
    setSelectedStatus(status);
  }

  useEffect(() => {
    // Carregar turmas e professores do sistema
    const loadData = async () => {
      setLoading(true);
      await loadClasses();
      await loadUsers({ page: currentPage, limit: pageLimit });
      setLoading(false);
    };
    loadData();
  }, [loadClasses, loadUsers, currentPage]);

  useEffect(() => {
    // start from users with role=professor
    let filtered = (users || []).filter((u) => u.role === "professor");

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (teacher) =>
          teacher.name?.toLowerCase().includes(term) ||
          teacher.email?.toLowerCase().includes(term),
      );
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (teacher) => teacher.department === selectedDepartment,
      );
    }

    if (selectedStatus !== "all") {
      const isActive = selectedStatus === "active";
      filtered = filtered.filter((teacher) => teacher.isActive === isActive);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredTeachers(filtered);
  }, [users, searchTerm, selectedDepartment, selectedStatus]);

  // Keep local page in sync with hook page
  useEffect(() => {
    if (typeof hookPage === "number" && hookPage !== currentPage) {
      setCurrentPage(hookPage);
    }
  }, [hookPage]);

  const handleDelete = (id) => {
    showModal({
      title: "Deletar Professor",
      message: "Tem certeza que deseja deletar este professor?",
      type: "danger",
      confirmText: "Deletar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        const res = await deleteUser(id);
        if (res.success) {
          await loadUsers({ page: currentPage, limit: pageLimit });
          showToast("Professor deletado com sucesso", "success");
        } else {
          showToast(res.message || "Erro ao deletar professor", "error");
        }
      },
    });
  };

  const handleEdit = (id) => {
    navigate(`/teachers/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/teachers/${id}`);
  };

  if (loading || usersLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 font-semibold text-lg">
            Carregando professores...
          </div>
        </div>
      </Layout>
    );
  }

  // Função para obter as turmas de um professor
  const getTeacherClasses = (teacherId) => {
    return classes.filter((cls) =>
      cls.teachers?.some((t) => t._id === teacherId || t === teacherId),
    );
  };

  return (
    <>
      <Layout>
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Professores</h1>
              <p className="text-gray-600 mt-2">
                Gerencie todos os professores do sistema
              </p>
            </div>
            <div className="flex gap-3">
              <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                Total:{" "}
                <span className="font-bold">
                  {filteredTeachers.length} professores
                </span>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter size={18} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Search
                placeholder="Buscar professor..."
                filters={[
                  {
                    key: "department",
                    label: "Departamento",
                    options: [
                      {
                        value: "Tecnologia da Informação",
                        label: "Tecnologia da Informação",
                      },
                      { value: "Infraestrutura", label: "Infraestrutura" },
                      { value: "Gestão", label: "Gestão" },
                    ],
                  },
                  {
                    key: "status",
                    label: "Status",
                    options: [
                      { value: "active", label: "Ativos" },
                      { value: "inactive", label: "Inativos" },
                    ],
                  },
                ]}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Tabela de professores */}
          {filteredTeachers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum professor encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ||
                selectedDepartment !== "all" ||
                selectedStatus !== "all"
                  ? "Nenhum professor corresponde aos filtros selecionados."
                  : "Não há professores cadastrados no sistema ainda."}
              </p>
              {(searchTerm ||
                selectedDepartment !== "all" ||
                selectedStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDepartment("all");
                    setSelectedStatus("all");
                  }}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Header do card */}
                  <div className="bg-linear-to-r from-red-600 to-red-700 px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {teacher.name?.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {teacher.name}
                          </h2>
                          <p className="text-red-100 text-sm">
                            {teacher.department}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          teacher.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {teacher.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>

                  {/* Corpo do card */}
                  <div className="p-6 space-y-4">
                    {/* Email e Telefone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    {/* Turmas */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Turmas que atua
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getTeacherClasses(teacher._id).length > 0 ? (
                          getTeacherClasses(teacher._id).map((cls) => (
                            <span
                              key={cls._id}
                              className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium border border-red-200"
                            >
                              {cls.code} - {cls.course}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            Nenhuma turma cadastrada
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Data de cadastro */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Cadastrado em{" "}
                        {new Date(teacher.createdAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(teacher._id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      {getTeacherClasses(teacher._id).length} turma
                      {getTeacherClasses(teacher._id).length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {typeof totalPages === "number" && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={async () => {
                  if (currentPage <= 1) return;
                  const prev = currentPage - 1;
                  setCurrentPage(prev);
                  await loadUsers({ page: prev, limit: pageLimit });
                }}
                disabled={currentPage <= 1}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={async () => {
                        if (p === currentPage) return;
                        setCurrentPage(p);
                        await loadUsers({ page: p, limit: pageLimit });
                      }}
                      className={`px-3 py-1 rounded ${
                        p === currentPage
                          ? "bg-red-600 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={async () => {
                  if (currentPage >= totalPages) return;
                  const next = currentPage + 1;
                  setCurrentPage(next);
                  await loadUsers({ page: next, limit: pageLimit });
                }}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 bg-gray-100 rounded"
              >
                Próxima
              </button>
            </div>
          )}

          {/* Rodapé com resumo */}
          <div className="mt-6 text-sm text-gray-600">
            Exibindo{" "}
            <span className="font-bold">{filteredTeachers.length}</span> de{" "}
            <span className="font-bold">{filteredTeachers.length}</span>{" "}
            professores
          </div>
        </div>
      </Layout>
      <Toast
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
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
    </>
  );
}
