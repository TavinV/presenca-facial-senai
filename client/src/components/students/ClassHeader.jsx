import PropTypes from "prop-types";
import { MdAdd, MdSchedule, MdDateRange, MdCode } from "react-icons/md";
import { FaChalkboardTeacher, FaUserPlus } from "react-icons/fa";

export function ClassHeader({ classDetails, onOpenAddModal, loading }) {
    if (loading) {
        return (
            <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    if (!classDetails) return null;

    return (
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaChalkboardTeacher className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Turma: {classDetails.course || classDetails.name}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Gerencie os alunos desta turma</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-3 text-gray-600">
                            <MdCode className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium">Código</p>
                                <p className="font-semibold">{classDetails.code || "—"}</p>
                            </div>
                        </div>


                        {classDetails.period && (
                            <div className="flex items-center space-x-3 text-gray-600">
                                <MdDateRange className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium">Período</p>
                                    <p className="font-semibold">{classDetails.period}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={onOpenAddModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <FaUserPlus className="h-5 w-5" />
                    <span>Adicionar Aluno</span>
                </button>
            </div>
        </div>
    );
}

ClassHeader.propTypes = {
    classDetails: PropTypes.object,
    onOpenAddModal: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};