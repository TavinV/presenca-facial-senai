import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaCheck,
  FaTimes,
  FaUser,
  FaIdBadge,
  FaEnvelope,
} from "react-icons/fa";
import { useStudents } from "../../hooks/useStudents";
import { useClasses } from "../../hooks/useClasses";

export default function StudentForm({
  mode: propMode,
  initialData: propData,
  onSubmit: propOnSubmit,
}) {
  const navigate = useNavigate();
  const params = useParams();
  const routeId = params.id;

  const mode = propMode || (routeId ? "edit" : "create");
  const [initialData, setInitialData] = useState(propData || null);

  const {
    createStudent,
    updateStudent,
    getStudent,
    loadStudents,
    encodeFace,
    validateImage,
    updateFacialId,
  } = useStudents();
  const { classes: availableClasses, loadClasses } = useClasses();

  const [form, setForm] = useState({
    name: "",
    registration: "",
    classCode: "",
    facialId: "",
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Se estiver em modo edit, buscar dados do aluno
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (mode === "edit" && routeId && !propData) {
        const res = await getStudent(routeId);
        if (res.success && mounted) {
          setInitialData(res.data);
          const data = res.data;
          setForm({
            name: data.name || "",
            registration: data.registration || "",
            classCode: (data.classes && data.classes[0]) || "",
            facialId: data.facialId || "",
            isActive: data.isActive !== undefined ? data.isActive : true,
          });
        }
      } else if (propData) {
        setForm({
          name: propData.name || "",
          registration: propData.registration || "",
          classCode: (propData.classes && propData.classes[0]) || "",
          facialId: propData.facialId || "",
          isActive: propData.isActive !== undefined ? propData.isActive : true,
        });
      }
    }
    load();
    return () => (mounted = false);
  }, [mode, routeId, propData, getStudent]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "classCode") {
      setForm((p) => ({ ...p, classCode: value }));
    } else if (type === "checkbox") {
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
      if (!form.name.trim() || !form.registration.trim()) {
        setError("Nome e matrícula são obrigatórios");
        setSubmitting(false);
        return;
      }

      if (mode === "create") {
        if (!form.facialId) {
          setError(
            "É necessário processar a imagem facial antes de criar o aluno."
          );
          setSubmitting(false);
          return;
        }

        const payload = {
          name: form.name,
          registration: form.registration,
          facialId: form.facialId,
          classCode: (form.classCode || "").toUpperCase(),
        };

        const res = propOnSubmit
          ? await propOnSubmit(payload)
          : await createStudent(payload);
        if (res.success) {
          setSuccess(true);
          // after create, reload students list and navigate
          await loadStudents();
          setTimeout(() => navigate("/students"), 1200);
        } else {
          setError(res.message || "Erro ao criar aluno");
        }
      } else {
        const id =
          routeId || (initialData && (initialData._id || initialData.id));
        if (!id) {
          setError("ID do aluno não encontrado para edição");
          setSubmitting(false);
          return;
        }
        // Only send allowed fields for update (name and classCode)
        const payload = {
          name: form.name,
          classCode: (form.classCode || "").toUpperCase(),
        };

        const res = propOnSubmit
          ? await propOnSubmit(payload)
          : await updateStudent(id, payload);
        if (res.success) {
          setSuccess(true);
          await loadStudents();
          setTimeout(() => navigate("/students"), 1200);
        } else {
          setError(res.message || "Erro ao atualizar aluno");
        }
      }
    } catch (err) {
      setError(err.message || "Erro no envio");
    } finally {
      setSubmitting(false);
    }
  };

  // Face handling
  const [faceFile, setFaceFile] = useState(null);
  const [faceProcessing, setFaceProcessing] = useState(false);
  const [faceProcessed, setFaceProcessed] = useState(false);

  const handleFaceSelect = (e) => {
    const file = e.target.files?.[0];
    setFaceFile(file || null);
  };

  const handleProcessFace = async () => {
    setError(null);
    if (!faceFile) return setError("Selecione uma imagem");
    const valid = validateImage(faceFile);
    if (!valid.valid) return setError(valid.message || "Imagem inválida");

    try {
      setFaceProcessing(true);
      const res = await encodeFace(faceFile);
      if (res.success) {
        // For create, store facialId directly; for edit, call updateFacialId
        if (mode === "create") {
          setForm((p) => ({ ...p, facialId: res.data }));
        } else {
          const id =
            routeId || (initialData && (initialData._id || initialData.id));
          if (id) {
            const upd = await updateFacialId(id, res.data);
            if (!upd.success) {
              setError(upd.message || "Erro ao atualizar facialId");
            }
          }
        }
        setFaceProcessed(true);
      } else {
        setError(res.message || "Erro ao processar face");
      }
    } catch (err) {
      setError(err.message || "Erro ao processar imagem");
    } finally {
      setFaceProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === "edit" ? "Editar Aluno" : "Cadastrar Novo Aluno"}
        </h1>
        <p className="text-gray-600 mt-2">
          {mode === "edit"
            ? "Atualize os dados do aluno"
            : "Preencha os dados para cadastrar um novo aluno"}
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <FaCheck size={20} />
          Aluno salvo com sucesso! Redirecionando...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <FaTimes size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <h2 className="text-xl font-bold text-white">
              Informações do Aluno
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
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Matrícula *
                </label>
                <input
                  type="text"
                  name="registration"
                  value={form.registration}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                  placeholder="Ex: 2025001"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Turma (classCode) *
                </label>
                <select
                  name="classCode"
                  value={form.classCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors bg-white"
                >
                  <option value="">Selecione a turma</option>
                  {(availableClasses || []).map((c) => (
                    <option key={c._id || c.id || c.code} value={c.code}>
                      {c.code} {c.course ? `— ${c.course}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
              />
              <label
                htmlFor="isActive"
                className="flex-1 text-gray-700 font-medium cursor-pointer"
              >
                Aluno Ativo
              </label>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  form.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {form.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>

            {/* Facial image */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <label className="block text-gray-700 font-semibold mb-2">
                Imagem facial
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaceSelect}
                />
                <button
                  type="button"
                  onClick={handleProcessFace}
                  disabled={faceProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
                >
                  {faceProcessing
                    ? "Processando..."
                    : mode === "edit"
                    ? "Atualizar rosto"
                    : "Processar rosto"}
                </button>
                <div className="text-sm text-gray-600">
                  {faceProcessed || form.facialId ? (
                    <span className="text-green-600 font-medium">
                      Rosto processado
                    </span>
                  ) : (
                    <span>Nenhum rosto processado</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/students")}
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
                    {mode === "edit" ? "Salvar Alterações" : "Criar Aluno"}
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
