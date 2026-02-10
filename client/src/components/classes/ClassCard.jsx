// components/classes/ClassCard.jsx
import { IoPeopleSharp } from "react-icons/io5";
import { FaBuilding, FaUsers, FaTrash } from "react-icons/fa6";
import { MdPlace, MdEdit } from "react-icons/md";
import Button from "../ui/Button";

export default function ClassCard({
  turma,
  onEdit,
  onDelete,
  onViewStudents,
  loading,
  coordinator,
}) {
  const id = turma._id || turma.id;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Cabeçalho do card */}
      <div className="bg-red-500 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {turma.code}
            </h2>
            <p className="text-blue-100 text-sm mt-1 truncate">
              {turma.course}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
              {turma.year}
            </div>
            <span className="inline-block bg-red-600 text-white text-xs font-medium px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
              {turma.shift}
            </span>
          </div>
        </div>
      </div>

      {/* Corpo do card */}
      <div className="p-4 sm:p-6 flex-1">
        {/* Professores */}
        <div className="mb-4">
          <div className="flex items-start text-gray-700 mb-2">
            <IoPeopleSharp
              size={18}
              className="text-gray-400 mt-0.5 flex-shrink-0"
            />
            <span className="ml-2 font-semibold text-sm sm:text-base truncate">
              Professores
            </span>
          </div>
          <p className="text-gray-800 text-sm sm:text-base ml-7 line-clamp-2">
            {turma.teachers?.map((prof) => prof.name).join(", ") ||
              "Nenhum professor"}
          </p>
        </div>

        {/* Salas */}
        <div className="mb-4">
          <div className="flex items-start text-gray-700 mb-2">
            <FaBuilding
              size={18}
              className="text-gray-400 mt-0.5 flex-shrink-0"
            />
            <span className="ml-2 font-semibold text-sm sm:text-base truncate">
              Salas
            </span>
          </div>
          <p className="text-gray-800 text-sm sm:text-base ml-7 line-clamp-2">
            {turma.rooms?.map((sala) => sala.name).join(", ") || "Nenhuma sala"}
          </p>
        </div>

        {/* Local */}
        <div>
          <div className="flex items-start text-gray-700 mb-2">
            <MdPlace size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="ml-2 font-semibold text-sm sm:text-base truncate">
              Local
            </span>
          </div>
          <p className="text-gray-800 text-sm sm:text-base ml-7 line-clamp-2">
            {turma.rooms?.map((lugar) => lugar.location).join(", ") ||
              "Não informado"}
          </p>
        </div>
      </div>

      {/* Rodapé do card */}
      <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200 mt-auto">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {/* Botão de Alunos - Sempre visível */}
          <button
            onClick={() => onViewStudents(id)}
            className={`flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm
                 px-3 sm:px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center min-w-[120px] ${!coordinator ? `w-full` : ``}`}
          >
            <FaUsers size={16} className="mr-2 flex-shrink-0" />
            <span className="truncate">Alunos</span>
          </button>

          {/* Botões de Editar e Excluir - Apenas para coordenadores */}
          {coordinator && (
            <>
              <Button
                onClick={() => onEdit(id)}
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center min-w-[120px]"
              >
                <MdEdit size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">Editar</span>
              </Button>

              <button
                onClick={() => onDelete(turma._id)}
                disabled={loading}
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center min-w-[120px]"
              >
                <FaTrash size={14} className="mr-2 flex-shrink-0" />
                <span className="truncate">Excluir</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
