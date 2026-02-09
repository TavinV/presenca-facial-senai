import Layout from "../components/layout/Layout";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import useModal from "../hooks/useModal";
import Search from "../components/ui/Search";
import useClasses from "../hooks/useClasses";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Componente criado
import ClassCard from "../components/classes/ClassCard";

//icons
import { FaPlus } from "react-icons/fa6";
import Button from "../components/ui/Button";

export default function ClassesPage() {
  const { classes, loading, error, loadClasses, loadMyClasses, deleteClass } =
    useClasses();

  const [filteredClasses, setFilteredClasses] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const showToast = (text, type = "info") => setMessage({ text, type });
  const { modalConfig, showModal, hideModal, handleConfirm } = useModal();
  const navigate = useNavigate();
  const { user } = useAuth();

  //Usando o context para diferenciar o get conforme o role
  useEffect(() => {
    if (user?.role === "professor") {
      loadMyClasses();
    } else {
      loadClasses();
    }
  }, [user?.role, loadClasses, loadMyClasses]);

  //Filtro e buscas
  useEffect(() => {
    setFilteredClasses(classes);
  }, [classes]);

  //Usando o hook para deletar turma
  const handleDelete = async (id) => {
    showModal({
      title: "Excluir Turma",
      message: "Tem certeza que deseja deletar?",
      type: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        setDeleteLoading(true);
        const result = await deleteClass(id);
        setDeleteLoading(false);
        if (!result.success) {
          showToast(result.message || "Erro ao deletar turma", "error");
        }
      },
    });
  };

  const handleViewStudents = (id) => {
    navigate("/classes/:id/students".replace(":id", id));
  };

  const handleEditClass = (id) => {
    navigate(`/classes/${id}/edit`);
  };

  function handleSearch({ search, filters }) {
    let result = classes;

    if (search) {
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.course.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filters.shift) {
      result = result.filter((c) => c.shift === filters.shift);
    }

    setFilteredClasses(result);
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-500 font-semibold text-lg">
            Carregando turmas...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <div className="font-bold text-lg mb-2">Erro ao carregar turmas</div>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <div className="p-4 sm:p-6">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Turmas</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Gerencie todas as turmas do sistema
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 flex items-center justify-center py-2 rounded-lg transition-colors duration-200 w-full sm:w-auto"
                onClick={() => navigate("/classes/new")}
              >
                <span className="whitespace-nowrap">Criar Turma</span>
                <FaPlus size={18} className="ml-2 flex-shrink-0" />
              </button>
              <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg whitespace-nowrap">
                Total:{" "}
                <span className="font-bold">
                  {filteredClasses.length} turmas
                </span>
              </div>
            </div>
          </div>

          <Search
            placeholder="Buscar turma..."
            filters={[
              {
                key: "shift",
                options: [
                  { value: "manha", label: "Manhã" },
                  { value: "tarde", label: "Tarde" },
                  { value: "noite", label: "Noite" },
                ],
              },
            ]}
            onChange={handleSearch}
          />

          {filteredClasses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center mt-6">
              <div className="text-gray-400 text-5xl sm:text-6xl mb-4">📚</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                Nenhuma turma encontrada
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                Não há turmas cadastradas no sistema ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
              {filteredClasses.map((turma) => (
                <ClassCard
                  key={turma._id || turma.id}
                  turma={turma}
                  onEdit={handleEditClass}
                  onDelete={handleDelete}
                  onViewStudents={handleViewStudents}
                  loading={deleteLoading}
                />
              ))}
            </div>
          )}
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