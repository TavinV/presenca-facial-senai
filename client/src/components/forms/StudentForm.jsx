import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaCheck,
  FaTimes,
  FaCamera,
  FaUserGraduate,
  FaIdCard,
  FaUsers,
  FaUserCheck,
  FaUser,
  FaArrowLeft,
  FaSave,
  FaInfoCircle
} from "react-icons/fa";
import { motion } from "framer-motion";

import { useStudents } from "../../hooks/useStudents";
import useClasses from "../../hooks/useClasses";
import { normalizeClasses } from "../../utils/normalizeClasses";

import StudentClassesSelect from "../students/StudentClassesSelect";
import FacialRecognitionSection from "../students/FacialRecognitionSection";

export default function StudentForm({
  mode: propMode,
  initialData: propData,
}) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  const mode = propMode || (routeId ? "edit" : "create");

  const {
    createStudent,
    updateStudent,
    getStudent,
    loadStudents,
    encodeFace,
    updateFacialId,
  } = useStudents();

  const { classes: availableClasses, loadMyClasses } = useClasses();

  const [facialEmbedding, setFacialEmbedding] = useState(null);

  const [form, setForm] = useState({
    name: "",
    registration: "",
    classes: [],
    facialEmbedding: null,
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceProcessing, setFaceProcessing] = useState(false);
  const [faceInfo, setFaceInfo] = useState(null);

  /* ───────────────── effects ───────────────── */

  useEffect(() => {
    loadMyClasses();
  }, [loadMyClasses]);

  useEffect(() => {
    let mounted = true;

    async function loadStudent() {
      if (mode === "edit" && routeId && !propData) {
        const res = await getStudent(routeId);
        if (res.success && mounted) {
          const d = res.data;
          console.log("Loaded student data:", d);
          setForm({
            name: d.name || "",
            registration: d.registration || "",
            classes: d.classes || [],
            isActive: d.isActive ?? true,
          });

          if (d.facialEmbedding?.alg) {
            setFaceInfo({
              status: "processed",
              nonce: d.facialEmbedding.nonce
            });
          }
        }
      }
    }

    loadStudent();
    return () => (mounted = false);
  }, [mode, routeId, propData, getStudent]);

  /* ───────────────── handlers ───────────────── */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClassesChange = (values) => {
    setForm((p) => ({ ...p, classes: values }));
  };

  const handleFaceCapture = async (imageBlobs) => {
    setError(null);
    setFaceProcessing(true);

    try {
      // imageBlobs agora é um array de 3 blobs
      console.log('Enviando', imageBlobs.length, 'imagens para processamento');

      const res = await encodeFace(imageBlobs);
      if (!res.success) throw new Error(res.message);

      const facialEmbedding = {
        embedding: res.data.embedding,
        nonce: res.data.nonce,
        image_count: res.data.image_count || 1 // Novo campo opcional
      };

      if (mode === "create") {
        setForm((p) => ({
          ...p,
          facialEmbedding,
        }));
      } else {
        setFacialEmbedding(facialEmbedding);
      }

      setFaceInfo({
        status: "processed",
        nonce: facialEmbedding.nonce,
        image_count: facialEmbedding.image_count
      });

      setShowFaceCapture(false);
    } catch (err) {
      console.error('Erro no processamento facial:', err);
      setError(err.message || "Erro ao processar rostos");
      setFaceInfo({ status: "error", message: err.message });
    } finally {
      setFaceProcessing(false);
    }
  };

  const handleRemoveFacial = () => {
    setForm((p) => ({
      ...p,
      facialEmbedding: null,
    }));
    setFaceInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!form.name.trim() || !form.registration.trim()) {
        throw new Error("Nome e matrícula são obrigatórios");
      }

      if (!form.classes.length) {
        throw new Error("Selecione pelo menos uma turma");
      }

      const payload = {
        name: form.name,
        registration: form.registration,
        classes: normalizeClasses(form.classes),
        isActive: form.isActive,
        ...(form.facialEmbedding && { facialEmbedding: form.facialEmbedding }),
      };

      if (mode === "create") {
        await createStudent(payload);
      } else {
        const id = routeId;
        await updateFacialId(id, facialEmbedding.embedding, facialEmbedding.nonce);
        await updateStudent(routeId, payload);
      }

      setSuccess(true);
      await loadStudents();
      setTimeout(() => navigate("/students"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const { isAuthenticated, isCoordinator, loading } = useAuth();



  /* ───────────────── render ───────────────── */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/students")}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FaArrowLeft />
            <span>Voltar para Alunos</span>
          </button>

          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl">
              <FaUserGraduate className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === "edit" ? "Editar Aluno" : "Cadastrar Novo Aluno"}
              </h1>
              <p className="text-gray-600 mt-1">
                {mode === "edit"
                  ? "Atualize os dados do aluno no sistema"
                  : "Preencha os dados abaixo para cadastrar um novo aluno"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <FaCheck className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Aluno salvo com sucesso!</p>
                <p className="text-sm text-green-700">Redirecionando para a lista de alunos...</p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <FaTimes className="text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-800">Erro ao processar</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Header do Form */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">
                    Informações do Aluno
                  </h2>
                </div>
                <div className="text-red-100 text-sm bg-red-800/30 px-3 py-1 rounded-full">
                  {mode === "edit" ? "Modo Edição" : "Novo Cadastro"}
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Seção: Dados Pessoais */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FaUser className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Dados Pessoais</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <span>Nome Completo</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FaUser />
                      </div>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Digite o nome completo do aluno"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Nome completo conforme documento oficial</p>
                  </div>

                  {/* Matrícula */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <span>Número de Matrícula</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FaIdCard />
                      </div>
                      <input
                        name="registration"
                        value={form.registration}
                        onChange={handleChange}
                        placeholder="Ex: 20241023001"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Matrícula única do aluno no sistema</p>
                  </div>
                </div>
              </div>

              {/* Seção: Turmas */}
              {
                ((!loading && isAuthenticated && isCoordinator) || mode === "create") ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FaUsers className="text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Turmas do Aluno</h3>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                        <span>Selecionar Turmas</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <StudentClassesSelect
                        value={form.classes}
                        classes={availableClasses}
                        onChange={handleClassesChange}
                      />
                      <p className="text-xs text-gray-500">Selecione uma ou mais turmas para o aluno</p>
                    </div>
                  </div>
                ): (
                  <></>
                )
              }
                    

              {/* Seção: Turmas */}
           

              {/* Seção: Status */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FaUserCheck className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Status do Aluno</h3>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-300 rounded-full peer peer-checked:bg-red-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                        Aluno Ativo
                      </span>
                      <p className="text-sm text-gray-600">
                        {form.isActive
                          ? "O aluno está ativo e pode ser marcado em presenças"
                          : "O aluno está inativo e não aparecerá nas listas de presença"}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {form.isActive ? "ATIVO" : "INATIVO"}
                    </div>
                  </label>
                </div>
              </div>

              {/* Seção: Reconhecimento Facial */}
              <FacialRecognitionSection
                faceInfo={faceInfo}
                processing={faceProcessing}
                onCapture={handleFaceCapture}
                onRemove={handleRemoveFacial}
                
              />

              {/* Seção: Ações */}
              <div className="pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/students")}
                    className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaArrowLeft />
                    <span>Cancelar</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-6 py-3.5 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${submitting
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl'
                      }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>{mode === "edit" ? "Salvar Alterações" : "Cadastrar Aluno"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Informações adicionais */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <div className="p-1 bg-red-100 rounded">
                        <FaCheck className="text-red-600 text-xs" />
                      </div>
                      <span>Campos marcados com * são obrigatórios</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="p-1 bg-red-100 rounded">
                        <FaCamera className="text-red-600 text-xs" />
                      </div>
                      <span>Reconhecimento facial é opcional</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="p-1 bg-red-100 rounded">
                        <FaUsers className="text-red-600 text-xs" />
                      </div>
                      <span>Aluno pode estar em múltiplas turmas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}