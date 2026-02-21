import Layout from "../components/layout/Layout";
import Search from "../components/ui/Search";
import { useEffect, useState } from "react";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";
import useModal from "../hooks/useModal";
import { Link } from "react-router-dom";
import { useTotems } from "../hooks/useTotems";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaDesktop,
  FaKey,
  FaSync,
  FaPlus,
  FaMapMarkerAlt,
  FaDoorOpen,
  FaPowerOff,
  FaClipboard,
  FaEye,
} from "react-icons/fa";
import { MdOutlineMeetingRoom } from "react-icons/md";

export default function TotemsPage() {
  const {
    totems,
    loadTotems,
    deleteTotem,
    toggleTotemStatus,
    getApiKey,
    regenerateApiKey,
  } = useTotems();
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const showToast = (text, type = "info") => setMessage({ text, type });
  const { modalConfig, showModal, hideModal, handleConfirm } = useModal();

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await loadTotems();
      setLoading(false);
    };
    initializeData();
  }, [loadTotems]);

  useEffect(() => {
    setFiltered(totems || []);
  }, [totems]);

  function handleSearch({ search }) {
    let res = totems || [];
    if (search) {
      res = res.filter(
        (t) =>
          (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (t.location || "").toLowerCase().includes(search.toLowerCase()),
      );
    }
    setFiltered(res);
  }

  async function handleDelete(id) {
    showModal({
      title: "Excluir Totem",
      message: "Tem certeza que deseja excluir este totem?",
      type: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        await deleteTotem(id);
        setFiltered((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      },
    });
  }

  async function handleToggle(id) {
    await toggleTotemStatus(id);
  }

  async function handleShowKey(id) {
    const result = await getApiKey(id);

    if (result.success === true) {
      navigator.clipboard.writeText(result.apiKey);
      showToast("Chave de totem copiada para a área de transferência!", "success");
    } else {
      showToast("Não foi possível recuperar a chave API", "error");
    }
  }

  async function handleRegenerate(id) {
    showModal({
      title: "Gerar nova chave de totem?",
      message: "Gerar uma nova chave de totem? A antiga será invalidada, e os totens associados desativados.",
      type: "warning",
      confirmText: "Gerar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        const result = await regenerateApiKey(id);
        if (result.success === true) {
          navigator.clipboard.writeText(result.apiKey);
          showToast(
            "Nova chave de totem gerada e copiada para a área de transferência!",
            "success",
          );
        } else {
          showToast("Não foi possível gerar nova chave de totem", "error");
        }
      },
    });
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaDesktop className="text-red-600 mr-3" />
            Totens
          </h1>
          <p className="text-gray-600">Gerencie todos os totens do sistema</p>
        </div>

        <div className="">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <Search
                placeholder="Buscar totem por nome ou local..."
                onChange={handleSearch}
              />
            </div>
            <Link
              to="/totems/new"
              className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaPlus className="mr-2" />
              Novo Totem
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600">Carregando totems...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <div className="text-gray-400 mb-4">
                <FaMapMarkerAlt className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum totem encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {totems.length === 0
                  ? "Comece adicionando seu primeiro totem"
                  : "Nenhum resultado corresponde à sua busca"}
              </p>
              {totems.length === 0 && (
                <Link
                  to="/totems/new"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <FaPlus className="mr-2" />
                  Criar Primeiro Totem
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t) => (
                <div
                  key={t.id || t._id}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Status Indicator */}
                  <div
                    className={`h-1 w-full ${t.isActive ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {t.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {t.isActive ? (
                            <>
                              <FaToggleOn className="mr-1" /> Ativo
                            </>
                          ) : (
                            <>
                              <FaToggleOff className="mr-1" /> Inativo
                            </>
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggle(t.id || t._id)}
                        className={`p-2 rounded-full ${t.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}
                        title={t.isActive ? "Desativar totem" : "Ativar totem"}
                      >
                        <FaPowerOff className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="w-4 h-4 mr-3 text-red-500" />
                        <span className="font-medium">Local:</span>
                        <span className="ml-2">
                          {t.location || "Não definido"}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MdOutlineMeetingRoom className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="font-medium">Sala:</span>
                        <span className="ml-2">
                          {t.room?.name || t.room || "Não definida"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <Link
                          to={`/totems/${t.id || t._id}/edit`}
                          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Editar totem"
                        >
                          <FaEdit className="mr-2" />
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(t.id || t._id)}
                          className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Excluir totem"
                        >
                          <FaTrash className="mr-2" />
                          Excluir
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShowKey(t.id || t._id)}
                          className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Mostrar chave de totem"
                        >
                          <FaClipboard className="mr-2" />
                          Copiar chave
                        </button>
                        <button
                          onClick={() => handleRegenerate(t.id || t._id)}
                          className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Gerar nova chave de totem"
                        >
                          <FaSync className="mr-2" />
                          Nova chave
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {!loading && filtered.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Mostrando{" "}
                <span className="font-semibold">{filtered.length}</span> de{" "}
                <span className="font-semibold">{totems.length}</span> totems
              </p>
            </div>
          )}
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
