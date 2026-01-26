import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCheck, FaTimes, FaUser, FaCalendarAlt } from "react-icons/fa";
import useAttendances from "../../hooks/useAttendances";

export default function AttendanceForm({
  mode: propMode,
  initialData: propData,
  onSubmit: propOnSubmit,
  classSession,
  student,
}) {
  const navigate = useNavigate();
  const params = useParams();
  const routeId = params.id;

  const mode = propMode || (routeId ? "edit" : "create");

  const { createManual, updateAttendance } = useAttendances();

  const [form, setForm] = useState({
    status: "presente",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (propData) {
      setForm({
        status: propData.status || "presente",
      });
    }
  }, [propData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!classSession?._id || !student?._id) {
        setError("Sessão ou aluno não identificado");
        setSubmitting(false);
        return;
      }

      const payload = {
        classSessionId: classSession._id,
        studentId: student._id,
        status: form.status,
      };

      const res =
        propOnSubmit ??
        (mode === "edit"
          ? await updateAttendance(routeId, payload)
          : await createManual(payload));

      if (res?.success !== false) {
        setSuccess(true);
        setTimeout(() => navigate(-1), 1200);
      } else {
        setError(res.message || "Erro ao salvar presença");
      }
    } catch (err) {
      setError(err.message || "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registrar Presença</h1>
        <p className="text-gray-600 mt-2">Sessão de aula e status do aluno</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <FaCheck size={20} />
          Presença registrada com sucesso!
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
            <h2 className="text-xl font-bold text-white">Dados da Presença</h2>
          </div>

          <div className="p-8 space-y-6">
            {/* Aluno */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
              <FaUser className="text-red-600" />
              <span className="font-semibold">{student?.name}</span>
            </div>

            {/* Sessão */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
              <FaCalendarAlt className="text-red-600" />
              <span>
                {new Date(classSession?.date).toLocaleString("pt-BR")}
              </span>
            </div>

            {/* Status */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Status da Presença
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              >
                <option value="presente">Presente</option>
                <option value="atrasado">Atrasado</option>
                <option value="ausente">Ausente</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? "Salvando..." : "Registrar Presença"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
