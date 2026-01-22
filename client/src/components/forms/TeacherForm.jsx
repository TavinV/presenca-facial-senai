import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaTimes } from "react-icons/fa";
import useUsers from "../../hooks/useUsers";

export default function TeacherForm({
  mode: propMode,
  initialData: propData,
  onSubmit: propOnSubmit,
}) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const mode = propMode || (routeId ? "edit" : "create");

  const {
    createUser,
    updateUser,
    getUser,
    loadUsers,
    activateUser,
    deactivateUser,
  } = useUsers();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "professor",
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [initialIsActive, setInitialIsActive] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (mode === "edit" && routeId && !propData) {
        const res = await getUser(routeId);
        if (res.success && mounted) {
          const u = res.data;
          setForm({
            name: u.name || "",
            email: u.email || "",
            password: "",
            role: u.role || "professor",
            isActive: u.isActive !== undefined ? u.isActive : true,
          });
          setInitialIsActive(u.isActive !== undefined ? u.isActive : true);
        }
      } else if (propData) {
        setForm({
          name: propData.name || "",
          email: propData.email || "",
          password: "",
          role: propData.role || "professor",
          isActive: propData.isActive !== undefined ? propData.isActive : true,
        });
        setInitialIsActive(
          propData.isActive !== undefined ? propData.isActive : true
        );
      }
    }
    load();
    return () => (mounted = false);
  }, [mode, routeId, propData, getUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!form.name.trim() || !form.email.trim()) {
        setError("Nome e email são obrigatórios");
        setSubmitting(false);
        return;
      }

      if (mode === "create") {
        if (!form.password || form.password.length < 6) {
          setError("Senha deve ter pelo menos 6 caracteres");
          setSubmitting(false);
          return;
        }

        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "professor",
        };

        const res = propOnSubmit
          ? await propOnSubmit(payload)
          : await createUser(payload);
        if (res.success) {
          setSuccess(true);
          await loadUsers();
          setTimeout(() => navigate("/teachers"), 800);
        } else {
          setError(res.message || "Erro ao criar professor");
        }
      } else {
        const id = routeId || (propData && (propData._id || propData.id));
        if (!id) {
          setError("ID do professor não encontrado");
          setSubmitting(false);
          return;
        }

        // Update allowed fields (name, email)
        const payload = {
          name: form.name,
          email: form.email,
        };

        const res = propOnSubmit
          ? await propOnSubmit(payload)
          : await updateUser(id, payload);
        if (res.success) {
          // handle isActive changes via activate/deactivate endpoints
          if (form.isActive !== initialIsActive) {
            if (form.isActive) {
              await activateUser(id);
            } else {
              await deactivateUser(id);
            }
          }

          setSuccess(true);
          await loadUsers();
          setTimeout(() => navigate("/teachers"), 800);
        } else {
          setError(res.message || "Erro ao atualizar professor");
        }
      }
    } catch (err) {
      setError(err.message || "Erro no envio");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate("/teachers")}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium mb-4 transition-colors"
        >
          <FaArrowLeft size={18} /> Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === "edit" ? "Editar Professor" : "Cadastrar Novo Professor"}
        </h1>
        <p className="text-gray-600 mt-2">
          {mode === "edit"
            ? "Atualize os dados do professor"
            : "Preencha os dados para cadastrar um novo professor"}
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <FaCheck size={20} />
          Professor salvo com sucesso! Redirecionando...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <FaTimes size={20} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <h2 className="text-xl font-bold text-white">
              Informações do Professor
            </h2>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                />
              </div>

              {mode === "create" && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Professor ativo</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/teachers")}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaCheck size={18} />
                    {mode === "edit" ? "Salvar Alterações" : "Criar Professor"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
