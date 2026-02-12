import {
    MdPeople,
    MdSchool,
    MdTag,
    MdRefresh,
    MdError,
    MdClose,
} from "react-icons/md";
import { FaUserGraduate, FaUserMinus } from "react-icons/fa";
import { GiGraduateCap } from "react-icons/gi";
import useModal  from "../../hooks/useModal.jsx";

export function StudentList({
    students,
    onRemoveStudent,
    loading,
    classCode,
    classDetails,
    hasMore,
    onLoadMore,
    addingStudent,
    removingStudent
}) {
    const { modalConfig, showModal, hideModal, handleConfirm } = useModal();

    const handleRemove = (studentId, studentName) => {
        showModal({
          title: "Remover Aluno da Turma",
          message: `Tem certeza que deseja remover ${studentName} da turma ${classDetails.course}? Esta ação não pode ser desfeita.`,
          type: "danger",
          confirmText: "Remover",
          cancelText: "Cancelar",
          confirmButtonProps: {
            className: "bg-red-600 hover:bg-red-700",
          },
          onConfirm: async () => {
            await onRemoveStudent(classCode, studentId);
          },
        });
    };

    if (loading && students.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <MdPeople className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Nenhum aluno matriculado nesta turma.</p>
                    <p className="text-sm text-gray-400">Adicione alunos usando o botão acima.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <MdPeople className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total de Alunos</p>
                            <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                            <MdSchool className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Alunos Ativos</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {students.filter(s => s?.isActive).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Alunos */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <FaUserGraduate className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Alunos Matriculados</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                                <MdPeople className="h-3 w-3 mr-1" />
                                {students.length}
                            </span>
                            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                                <MdSchool className="h-3 w-3 mr-1" />
                                {students.filter(s => s?.isActive).length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {students.filter(Boolean).map((student) => (

                        <div
                            key={student?._id}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
                        >
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-semibold">
                                        {student?.name.charAt(0) || "U"}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-800">{student?.name}</span>
                                        {student?.isActive ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Inativo
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1 flex items-center">
                                        <GiGraduateCap className="h-3 w-3 mr-1 text-gray-400" />
                                        Matrícula: <span className="font-mono ml-1">{student?.registration}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-2">
                                        <span className="flex items-center">
                                            <MdTag className="h-3 w-3 mr-1" />
                                            ID: <span className="font-mono ml-1">{student?._id.substring(0, 8)}...</span>
                                        </span>
                                        {student?.createdAt && (
                                            <span className="flex items-center">
                                                <MdSchool className="h-3 w-3 mr-1" />
                                                Cadastrado em: {new Date(student?.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <div className="text-sm text-gray-600 flex items-center justify-end">
                                        <MdPeople className="h-3 w-3 mr-1" />
                                        {student?.classes?.length || 0} turma(s)
                                    </div>
                                    <div className="text-xs text-gray-400 max-w-[120px] truncate">
                                        {student?.classes?.join(', ')}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(student?._id, student.name)}
                                    disabled={removingStudent === student?._id}
                                    className={`p-2 rounded-lg transition-colors flex items-center ${removingStudent === student?._id
                                        ? "bg-gray-100 text-gray-400 cursor-wait"
                                        : "text-red-600 hover:bg-red-50 hover:text-red-700"
                                        }`}
                                    title="Remover aluno da turma"
                                >
                                    {removingStudent === student?._id ? (
                                        <MdRefresh className="animate-spin h-5 w-5" />
                                    ) : (
                                        <FaUserMinus className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botão Carregar Mais */}
            {hasMore && (
                <div className="text-center">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto"
                    >
                        {loading ? (
                            <>
                                <MdRefresh className="animate-spin h-4 w-4 mr-2" />
                                Carregando mais alunos...
                            </>
                        ) : (
                            "Carregar mais alunos"
                        )}
                    </button>
                </div>
            )}

            {/* Modal de Confirmação */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${modalConfig.type === 'danger' ? 'bg-red-100 text-red-600' : modalConfig.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {modalConfig.type === 'danger' ? (
                                        <MdError className="h-6 w-6" />
                                    ) : modalConfig.type === 'warning' ? (
                                        <MdWarning className="h-6 w-6" />
                                    ) : modalConfig.type === 'success' ? (
                                        <MdCheckCircle className="h-6 w-6" />
                                    ) : (
                                        <MdInfo className="h-6 w-6" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">{modalConfig.title}</h3>
                            </div>
                            <button
                                onClick={hideModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MdClose className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="px-6 py-4">
                            <p className="text-gray-700">{modalConfig.message}</p>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            {modalConfig.showCancel && (
                                <button
                                    onClick={hideModal}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    {modalConfig.cancelText}
                                </button>
                            )}
                            {modalConfig.showConfirm && (
                                <button
                                    onClick={handleConfirm}
                                    className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${modalConfig.confirmButtonProps?.className || (modalConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : modalConfig.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700')}`}
                                >
                                    {modalConfig.confirmText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}