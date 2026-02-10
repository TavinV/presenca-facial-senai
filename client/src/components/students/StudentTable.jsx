import { FaEdit, FaTrash } from "react-icons/fa";

export default function StudentsTable({ students, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Matrícula
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Turmas
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr
                key={student._id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {student.name?.charAt(0) || "A"}
                    </div>
                    <span className="font-medium text-gray-900">
                      {student.name || "N/A"}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {student.registration || "N/A"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2 flex-wrap">
                    {student.classes && student.classes.length > 0 ? (
                      student.classes.map((className, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {className}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">Sem turmas</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      student.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {student.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(student._id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <FaEdit size={18} />
                    </button>

                    <button
                      onClick={() => onDelete(student._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deletar"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
