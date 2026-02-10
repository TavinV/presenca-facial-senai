import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../hooks/useStudents";

import Layout from "../components/layout/Layout";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import useModal from "../hooks/useModal";
import Search from "../components/ui/Search";
import StudentsTable from "../components/students/StudentTable.jsx";

import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from "react-icons/fa";

export default function StudentsPage() {
  const {
    students,
    loading,
    error,
    loadStudents,
    deleteStudent,
    page: hookPage,
    totalPages,
  } = useStudents();
  const [filteredStudents, setFilteredStudents] = useState([]);
  // pagination local state
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 10;
  const [message, setMessage] = useState({ text: "", type: "" });
  const showToast = (text, type = "info") => setMessage({ text, type });
  const { modalConfig, showModal, hideModal, handleConfirm } = useModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    loadStudents({ page: currentPage, limit: pageLimit });
  }, [currentPage]);

  // Sempre sincroniza o estado filtrado quando a lista de alunos mudar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredStudents(students || []);

  }, [students, hookPage, currentPage]);

  // Construir opções de filtro de turma a partir dos alunos carregados
  const classOptions = useMemo(() => {
    const all = Array.isArray(students)
      ? students.flatMap((s) => s.classes || [])
      : [];
    const unique = Array.from(new Set(all));
    return unique.map((c) => ({ value: c, label: c }));
  }, [students]);

  function handleSearch({ search, filters }) {
    const resultBase = Array.isArray(students) ? [...students] : [];

    // Atualiza estados auxiliares para mensagens e botão limpar
    setSearchTerm(search || "");
    const classFilter = filters?.classCode || "all";
    setSelectedClass(classFilter);

    let result = resultBase;

    // Filtro de busca textual
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (student) =>
          (student.name && student.name.toLowerCase().includes(lowerSearch)) ||
          (student.registration &&
            student.registration.toLowerCase().includes(lowerSearch)),
      );
    }

    // Filtro por turma (classCode)
    if (classFilter && classFilter !== "all") {
      result = result.filter((student) =>
        (student.classes || []).includes(classFilter),
      );
    }

    setFilteredStudents(result);
  }

  const handleDelete = async (id) => {
    showModal({
      title: "Deletar Aluno",
      message: "Tem certeza que deseja deletar este aluno?",
      type: "danger",
      confirmText: "Deletar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        const result = await deleteStudent(id);
        if (result.success) {
          showToast("Aluno deletado com sucesso", "success");
        } else {
          showToast(result.message || "Erro ao deletar aluno", "error");
        }
      },
    });
  };

  const handleEdit = (id) => {
    navigate(`/students/${id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-blue-500 font-semibold text-lg">
            Carregando alunos...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <div className="font-bold text-lg mb-2">Erro ao carregar alunos</div>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Cabeçalho */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Alunos</h1>
            <p className="text-gray-600 mt-2">
              Gerencie todos os alunos do sistema
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/students/new")}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FaPlus size={18} />
              Novo Aluno
            </button>
            <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
              Total: <span className="font-bold">{students.length} alunos</span>
            </div>
          </div>
        </div>

        <Search
          placeholder="Buscar aluno..."
          filters={[
            { key: "classCode", label: "Turma", options: classOptions },
          ]}
          onChange={handleSearch}
        />

        {/* Tabela de alunos */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum aluno encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedClass !== "all"
                ? "Nenhum aluno corresponde aos filtros selecionados."
                : "Não há alunos cadastrados no sistema ainda."}
            </p>
            {(searchTerm || selectedClass !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedClass("all");
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <StudentsTable
            students={filteredStudents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Pagination controls */}
        {typeof totalPages === "number" && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={async () => {
                if (currentPage <= 1) return;
                const prev = currentPage - 1;
                setCurrentPage(prev);
              }}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-gray-100 rounded"
            >
              Anterior
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={async () => {
                    if (p === currentPage) return;
                    setCurrentPage(p);
                  }}
                  className={`px-3 py-1 rounded ${
                    p === currentPage ? "bg-red-600 text-white" : "bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={async () => {
                if (currentPage >= totalPages) return;
                const next = currentPage + 1;
                setCurrentPage(next);
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
          Exibindo <span className="font-bold">{filteredStudents.length}</span>{" "}
          de <span className="font-bold">{students.length}</span> alunos
        </div>
      </div>

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
    </Layout>
  );
}
