import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    MdClose,
    MdSearch,
    MdCheckCircle,
    MdAdd,
    MdCancel,
    MdRefresh,
    MdOutlineClass
} from "react-icons/md";
import { FaUserGraduate, FaUserMinus } from "react-icons/fa";
import { useStudents } from "../../hooks/useStudents.jsx";

export function AddStudentModal({ isOpen, onClose, onAddStudent, classCode, existingStudents }) {
    const { students: allStudents, loading, loadStudents, totalPages } = useStudents();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPage(1);
            loadStudents({ page: 1, limit: 20 });
        }
    }, [isOpen]);

    // Verifica se o aluno já está na turma (usando o array classes)
    const isStudentInClass = (student) => {
        return student.classes?.includes(classCode) ||
            existingStudents.some(existing => existing._id === student._id);
    };

    // Filtrar alunos que ainda não estão na turma
    const availableStudents = allStudents.filter(student => !isStudentInClass(student));

    // Filtrar por termo de busca
    const filteredStudents = searchTerm
        ? availableStudents.filter(
            (student) =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.registration.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : availableStudents;

    const handleSelectStudent = (student) => {
        if (selectedStudents.some((s) => s._id === student._id)) {
            setSelectedStudents(selectedStudents.filter((s) => s._id !== student._id));
        } else {
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const handleAddSelected = async () => {
        if (selectedStudents.length === 0) return;

        let allSuccess = true;
        for (const student of selectedStudents) {
            const response = await onAddStudent(classCode, student._id);
            if (!response.success) {
                allSuccess = false;
            }
        }

        if (allSuccess) {
            setSelectedStudents([]);
            onClose();
        }
    };

    const handleLoadMore = async () => {
        if (page >= totalPages) return;

        setLoadingMore(true);
        const nextPage = page + 1;
        await loadStudents({ page: nextPage, limit: 20 });
        setPage(nextPage);
        setLoadingMore(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Cabeçalho */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaUserGraduate className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Adicionar Alunos</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Selecione os alunos para adicionar à turma {classCode}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MdClose className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Busca e Contador */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou matrícula..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <div className="text-sm text-gray-600">
                            {selectedStudents.length > 0 && (
                                <span className="flex items-center">
                                    <MdCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    {selectedStudents.length} aluno(s) selecionado(s)
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">
                            {filteredStudents.length} aluno(s) disponível(is)
                        </div>
                    </div>
                </div>

                {/* Lista de Alunos */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading && page === 1 ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm
                                ? "Nenhum aluno encontrado com este termo"
                                : "Todos os alunos já estão matriculados nesta turma"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student._id}
                                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${selectedStudents.some((s) => s._id === student._id)
                                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                        }`}
                                    onClick={() => handleSelectStudent(student)}
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.some((s) => s._id === student._id)}
                                            onChange={() => handleSelectStudent(student)}
                                            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">{student.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                Matrícula: {student.registration}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {student.isActive ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Inativo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 flex items-center">
                                            <MdOutlineClass className="h-3 w-3 mr-1" />
                                            {student.classes?.length || 0} turma(s)
                                        </div>
                                        <div className="text-xs text-gray-400 truncate max-w-[150px]">
                                            {student.classes?.join(', ')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Botão Carregar Mais */}
                    {page < totalPages && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center justify-center mx-auto ${loadingMore
                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                        : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                                    }`}
                            >
                                {loadingMore ? (
                                    <>
                                        <MdRefresh className="animate-spin h-4 w-4 mr-2" />
                                        Carregando...
                                    </>
                                ) : (
                                    "Carregar mais alunos"
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Rodapé */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Total de alunos carregados: {allStudents.length}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            <MdCancel className="h-4 w-4" />
                            <span>Cancelar</span>
                        </button>
                        <button
                            onClick={handleAddSelected}
                            disabled={selectedStudents.length === 0 || loading}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${selectedStudents.length === 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            <MdAdd className="h-4 w-4" />
                            <span>{loading ? "Adicionando..." : `Adicionar ${selectedStudents.length}`}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

AddStudentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddStudent: PropTypes.func.isRequired,
    classCode: PropTypes.string.isRequired,
    existingStudents: PropTypes.array.isRequired,
};