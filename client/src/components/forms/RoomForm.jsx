import { useEffect, useState } from "react";
import { useRooms } from "../../hooks/useRooms";
import useModal from "../../hooks/useModal";
import Modal from "../ui/Modal";
import Toast from "../ui/Toast";
import {
  FaBuilding,
  FaHashtag,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaSave,
  FaPlus,
  FaSpinner,
  FaDoorOpen,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { ImBlocked } from "react-icons/im";
import PageHeader from "../layout/PageHeader.jsx"

export default function RoomForm({
  mode = "create",
  initialData = {},
  onSubmit,
}) {
  const { createRoom, editRoom } = useRooms();
  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const { modalConfig, showModal, hideModal, handleConfirm } = useModal();

  // Função para mostrar Toast
  const showToast = (text, type = "info") => {
    setMessage({ text, type });
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm((f) => ({
        ...f,
        name: initialData.name || "",
        code: initialData.code || "",
        location: initialData.location || "",
        isActive:
          typeof initialData.isActive === "boolean"
            ? initialData.isActive
            : true,
      }));
    }
  }, [mode, initialData]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Toggle para ativar/desativar
  const toggleActive = () => {
    setForm(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validação básica
    if (!form.name.trim()) {
      showToast("O nome da sala é obrigatório", "warning");
      return;
    }

    if (!form.code.trim()) {
      showToast("O código da sala é obrigatório", "warning");
      return;
    }

    // Mostrar modal de confirmação
    showModal({
      title: mode === "edit" ? "Salvar Alterações" : "Criar Sala",
      message: mode === "edit"
        ? "Deseja salvar as alterações nesta sala?"
        : "Deseja criar esta nova sala?",
      type: "info",
      confirmText: mode === "edit" ? "Salvar" : "Criar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        await performSubmit();
      }
    });
  }

  async function performSubmit() {
    setSubmitting(true);
    try {
      let result;
      if (mode === "edit") {
        const id = initialData.id || initialData._id;
        result = onSubmit ? await onSubmit(form) : await editRoom(id, form);
      } else {
        result = onSubmit ? await onSubmit(form) : await createRoom(form);
      }

      if (!result?.success) {
        throw new Error(result?.message || "Erro ao salvar sala");
      }

      // Mostrar toast de sucesso
      showToast(
        mode === "edit"
          ? "Sala atualizada com sucesso!"
          : "Sala criada com sucesso!",
        "success"
      );

      window.location.href = "/rooms";


      // Limpar formulário se for criação
      if (mode !== "edit" && !onSubmit) {
        setForm({ name: "", code: "", location: "", isActive: true });
      }

    } catch (err) {
      showToast(err.message || "Erro ao salvar a sala", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <PageHeader
        backTo={"/rooms"}
        icon={FaBuilding}
        title={mode === "edit" ? "Editar sala" : "Cadastrar uma sala"}
        subtitle={
          mode === "edit"
            ? "Atualize os dados da sala selecionada"
            : "Cadastrar uma nova sala"
        }
      />
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Cabeçalho do Formulário */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
          <div className="flex items-center">
            <div className="bg-white/20 p-2.5 rounded-lg mr-4">
              <FaDoorOpen className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === "edit" ? "Editar Sala" : "Nova Sala"}
              </h2>
              <p className="text-red-100 text-sm mt-1">
                {mode === "edit"
                  ? "Atualize os dados da sala"
                  : "Preencha os campos para criar uma nova sala"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Nome da Sala */}
            <div>
              <label className="block mb-3">
                <div className="flex items-center text-gray-700 font-medium mb-2">
                  <FaBuilding className="text-red-600 mr-2" />
                  Nome da Sala *
                </div>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Laboratório de Informática A"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder-gray-400"
              />
              <p className="text-sm text-gray-500 mt-1">
                Nome completo da sala para identificação
              </p>
            </div>

            {/* Código e Localização em Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código */}
              <div>
                <label className="block mb-3">
                  <div className="flex items-center text-gray-700 font-medium mb-2">
                    <FaHashtag className="text-red-600 mr-2" />
                    Código da Sala *
                  </div>
                </label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Ex: LAB-INF-A"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder-gray-400"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Código único para identificação rápida
                </p>
              </div>

              {/* Localização */}
              <div>
                <label className="block mb-3">
                  <div className="flex items-center text-gray-700 font-medium mb-2">
                    <FaMapMarkerAlt className="text-red-600 mr-2" />
                    Localização
                  </div>
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Ex: Bloco B, 2º Andar"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder-gray-400"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Local específico dentro do campus
                </p>
              </div>
            </div>

            {/* Status da Sala */}
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div
                  className={`p-3 rounded-lg mr-4 ${form.isActive ? "bg-green-100" : "bg-gray-100"}`}
                >
                  {form.isActive ? (
                    <FaCheck className="text-green-500 text-xl" />
                  ) : (
                    <ImBlocked className="text-gray-500 text-xl" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Status da Sala
                  </span>
                  <p className="text-sm text-gray-500">
                    {form.isActive
                      ? "Sala disponível para uso"
                      : "Sala indisponível temporariamente"}
                  </p>
                </div>
              </div>

              {/* Toggle Switch Estilizado */}
              <button
                type="button"
                onClick={toggleActive}
                className="relative focus:outline-none"
              >
                <div className="w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 bg-gray-300">
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${form.isActive ? "translate-x-7 bg-green-500" : ""}`}
                  />
                </div>
                <div className="absolute top-0 left-0 w-14 h-7 flex items-center justify-between px-1 pointer-events-none">
                  <FaTimes
                    className={`text-xs ${form.isActive ? "text-gray-400" : "text-white"}`}
                  />
                  <FaCheck
                    className={`text-xs ${form.isActive ? "text-white" : "text-gray-400"}`}
                  />
                </div>
              </button>
            </div>

            {/* Campos Obrigatórios */}
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">
                  Campos marcados com * são obrigatórios.
                </span>{" "}
                Uma sala ativa estará disponível para agendamento de aulas.
              </p>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3">
                    <FaSpinner className="hidden" />
                  </div>
                  {mode === "edit" ? "Salvando..." : "Criando..."}
                </>
              ) : (
                <>
                  {mode === "edit" ? (
                    <>
                      <FaSave className="mr-2" />
                      Salvar Alterações
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" />
                      Criar Sala
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      <Toast
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
      />

      {/* Modal */}
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
    </div>
  );
}