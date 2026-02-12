import { FiClock } from "react-icons/fi";
import AttendanceActions from "./AttendanceActions";

export default function StudentsTable({
    sessionInfo,
    sortedStudents,
    selectedStudents,
    sortBy,
    sortOrder,
    onToggleSelectAll,
    onSortChange,
    onToggleStudentSelection,
    onMarkPresent,
    onMarkLate,
    onMarkAbsent
}) {
    const isClosed = sessionInfo.status !== "active";

    const getRowClass = (status) => {
        switch (status) {
            case "presente":
                return "bg-green-100";
            case "atrasado":
                return "bg-yellow-100";
            case "ausente":
                return "bg-red-100";
            default:
                return "bg-white";
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "presente":
                return "bg-green-200 text-green-800 border border-green-300";
            case "atrasado":
                return "bg-yellow-200 text-yellow-800 border border-yellow-300";
            case "ausente":
                return "bg-red-200 text-red-800 border border-red-300";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div
            className={`overflow-x-auto transition-opacity ${isClosed ? "opacity-95" : ""
                }`}
        >
            <table className="min-w-full divide-y divide-gray-200">
                {/* ===== CABEÇALHO ===== */}
                <thead className="bg-gray-50">
                    <tr>
                        {/* CHECKBOX MASTER */}
                        <th className="px-6 py-3 w-12">
                            {!isClosed && (
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedStudents.length === sortedStudents.length &&
                                        sortedStudents.length > 0
                                    }
                                    onChange={onToggleSelectAll}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                            )}
                        </th>

                        {/* NOME */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {!isClosed ? (
                                <button
                                    onClick={() => onSortChange("nome")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                >
                                    <span>Nome</span>
                                    {sortBy === "nome" && (
                                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                                    )}
                                </button>
                            ) : (
                                <span>Nome</span>
                            )}
                        </th>

                        {/* MATRÍCULA */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {!isClosed ? (
                                <button
                                    onClick={() => onSortChange("matricula")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                >
                                    <span>Matrícula</span>
                                    {sortBy === "matricula" && (
                                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                                    )}
                                </button>
                            ) : (
                                <span>Matrícula</span>
                            )}
                        </th>

                        {/* HORÁRIO */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {!isClosed ? (
                                <button
                                    onClick={() => onSortChange("horario")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                >
                                    <span>Horário</span>
                                    {sortBy === "horario" && (
                                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                                    )}
                                </button>
                            ) : (
                                <span>Horário</span>
                            )}
                        </th>

                        {/* STATUS */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>

                        {/* AÇÕES (SOMENTE SE A SESSÃO ESTIVER ABERTA) */}
                        {!isClosed && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        )}
                    </tr>
                </thead>

                {/* ===== CORPO ===== */}
                <tbody className="divide-y divide-gray-200">
                    {sortedStudents.map((student) => (
                        <tr
                            key={`${student.studentId}-${student.status}`}
                            className={`transition-colors ${getRowClass(student.status)}`}
                        >
                            {/* CHECKBOX */}
                            <td className="px-6 py-4">
                                {!isClosed && (
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(student.studentId)}
                                        onChange={() =>
                                            onToggleStudentSelection(student.studentId)
                                        }
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                )}
                            </td>

                            {/* NOME */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {student.nome}
                                </div>
                            </td>

                            {/* MATRÍCULA */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">
                                    {student.matricula}
                                </div>
                            </td>

                            {/* HORÁRIO */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <FiClock className="text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {student.horario}
                                    </span>
                                </div>
                            </td>

                            {/* STATUS */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                        student.status
                                    )}`}
                                >
                                    {student.status.charAt(0).toUpperCase() +
                                        student.status.slice(1)}
                                </span>
                            </td>

                            {/* AÇÕES */}
                            {!isClosed && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <AttendanceActions
                                        student={student}
                                        onMarkPresent={onMarkPresent}
                                        onMarkLate={onMarkLate}
                                        onMarkAbsent={onMarkAbsent}
                                    />
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
