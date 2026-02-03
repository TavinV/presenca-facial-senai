import Layout from "../components/layout/Layout";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import useModal from "../hooks/useModal";
import Search from "../components/ui/Search";
import useClasses from "../hooks/useClasses";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

//icons
import { IoPeopleSharp } from "react-icons/io5";
import { FaBuilding } from "react-icons/fa6";
import { MdPlace } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

import Button from "../components/ui/Button";

export default function ClassesPage() {
  const { classes, loading, error, loadClasses, loadMyClasses, deleteClass } =
    useClasses();

  const [filteredClasses, setFilteredClasses] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
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
        const result = await deleteClass(id);
        if (!result.success) {
          showToast(result.message || "Erro ao deletar turma", "error");
        }
      },
    });
  };

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

  return (
    <>
      <Layout>
        <div className="p-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Turmas</h1>
              <p className="text-gray-600 mt-2">
                Gerencie todas as turmas do sistema
              </p>
            </div>
            <div className="flex gap-5">
              <button
                className="ml-3 bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 flex items-center justify-between py-1 rounded-lg transition-colors duration-200"
                onClick={() => navigate("/classes/new")}
              >
                Criar Turma
                <FaPlus size={18} className="flex items-center ml-2" />
              </button>
              <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
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
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma turma encontrada
              </h3>
              <p className="text-gray-500">
                Não há turmas cadastradas no sistema ainda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((turma) => {
                const id = turma._id || turma.id;
                return (
                  <div
                    key={id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
                  >
                    {/* Cabeçalho do card */}
                    <div className="bg-red-500 px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {turma.code}
                          </h2>
                          <p className="text-blue-100 text-sm mt-1">
                            {turma.course}
                          </p>
                        </div>
                        <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {turma.year}
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="inline-block bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                          {turma.shift}
                        </span>
                      </div>
                    </div>

                    {/* Corpo do card */}
                    <div className="p-6">
                      {/* Professores */}
                      <div className="mb-4">
                        <div className="flex items-center text-gray-700 mb-2">
                          <IoPeopleSharp size={18} className="text-gray-400" />
                          <span className="ml-2 font-semibold">
                            Professores
                          </span>
                        </div>
                        <p className="text-gray-800 ml-7">
                          {turma.teachers
                            ?.map((prof) => prof.name)
                            .join(", ") || "Nenhum professor"}
                        </p>
                      </div>

                      {/* Salas */}
                      <div className="mb-4">
                        <div className="flex items-center text-gray-700 mb-2">
                          <FaBuilding size={18} className="text-gray-400" />
                          <span className="ml-2 font-semibold">Salas</span>
                        </div>
                        <p className="text-gray-800 ml-7">
                          {turma.rooms?.map((sala) => sala.name).join(", ") ||
                            "Nenhuma sala"}
                        </p>
                      </div>

                      {/* Local */}
                      <div>
                        <div className="flex items-center text-gray-700 mb-2">
                          <MdPlace size={20} className="text-gray-400" />
                          <span className="ml-2 font-semibold">Local</span>
                        </div>
                        <p className="text-gray-800 ml-7">
                          {turma.rooms
                            ?.map((lugar) => lugar.location)
                            .join(", ") || "Não informado"}
                        </p>
                      </div>
                    </div>

                    {/* Rodapé do card */}
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 mt-auto">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() =>
                            navigate("/classes/:id/students".replace(":id", id))
                          }
                          className="text-gray-600 hover:text-black text-center font-medium text-sm px-4 py-2 hover:bg-red-50 rounded-md transition-colors duration-200"
                        >
                          Alunos
                        </button>
                        <Button
                          onClick={() => navigate(`/classes/${id}/edit`)}
                          className="flex ml-3 bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 rounded-md transition-colors duration-200"
                        >
                          <MdEdit
                            size={18}
                            className="flex items-center mr-2"
                          />
                          Editar
                        </Button>
                        <button
                          onClick={() => handleDelete(turma._id)}
                          disable={loading}
                          className="flex items-center ml-3 bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 rounded-md transition-colors duration-200"
                        >
                          <FaTrash
                            size={15}
                            className="flex items-center mr-2"
                          />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
