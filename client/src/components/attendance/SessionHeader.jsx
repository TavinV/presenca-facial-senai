import { FiEdit2, FiSave, FiCalendar, FiX } from "react-icons/fi";

export default function SessionHeader({
  sessionInfo,
  isEditing,
  editForm,
  onEditChange,
  onSave,
  onCancelEdit,
  onCloseSession,
}) {
  const isClosed = sessionInfo.status !== "active";

  // Formatar horário de término
  const formatEndTime = (endsAt) => {
    if (!endsAt) return "Horário não definido";
    return new Date(endsAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex flex-col md:flex-row justify-between items-start mb-4 gap-4 transition-all
        ${isClosed ? "opacity-70 grayscale" : ""}
      `}
    >
      {/* INFO DA AULA */}
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editForm.name}
              disabled={isClosed}
              onChange={(e) => onEditChange("name", e.target.value)}
              className={`text-2xl font-bold border-b-2 focus:outline-none w-full
                ${
                  isClosed
                    ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                    : "border-red-500"
                }
              `}
              placeholder="Nome da aula"
            />

            <input
              type="date"
              value={editForm.date}
              disabled={isClosed}
              onChange={(e) => onEditChange("date", e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full
                ${isClosed ? "bg-gray-100 cursor-not-allowed" : ""}
              `}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {sessionInfo.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
              <span className="flex items-center space-x-1">
                <FiCalendar />
                <span>
                  {new Date(sessionInfo.date).toLocaleDateString("pt-BR")}
                </span>
              </span>

              {sessionInfo.endsAt && (
                <span className="flex items-center space-x-1 text-gray-600">
                  <FiX className="text-gray-400" />
                  <span>Término: {formatEndTime(sessionInfo.endsAt)}</span>
                </span>
              )}

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium
                  ${
                    isClosed
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }
                `}
              >
                {isClosed ? "Fechada" : "Aberta"}
              </span>

              <span className="text-sm text-gray-500">
                ID: {sessionInfo._id?.substring(0, 8) || "..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AÇÕES */}
      <div className="flex space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              disabled={isClosed}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                ${
                  isClosed
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }
              `}
            >
              <FiSave />
              <span>Salvar</span>
            </button>

            <button
              onClick={onCancelEdit}
              disabled={isClosed}
              className={`px-4 py-2 rounded-lg transition-colors
                ${
                  isClosed
                    ? "border border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEditChange("isEditing", true)}
              disabled={isClosed}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                ${
                  isClosed
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              <FiEdit2 />
              <span>Editar</span>
            </button>

            {!isClosed && (
              <button
                onClick={onCloseSession}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiX />
                <span>Fechar Aula</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
