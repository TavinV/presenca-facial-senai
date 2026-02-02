import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FiRefreshCw,
    FiDownload,
    FiUsers
} from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";
import Layout from "../components/layout/Layout";
import Toast from "../components/ui/Toast";
import Modal from "../components/ui/Modal"; // Importar o Modal
import Loading from "../components/ui/Loading";
import useAttendances from "../hooks/useAttendances";
import ClassesSessions from "../hooks/useClassesSessions";
import useModal from "../hooks/useModal"; // Importar o hook useModal
import SessionHeader from "../components/attendance/SessionHeader";
import StatsCards from "../components/attendance/StatsCards";
import BulkActions from "../components/attendance/BulkActions";
import StudentsTable from "../components/attendance/StudentsTable";

export default function ClassAttendancePage() {
    // Pegar ID da URL
    const { id } = useParams();

    // Hooks
    const {
        getFullReportBySession,
        createManual,
        deleteAttendance,
        getBySession,
        loading: attendanceLoading
    } = useAttendances();

    const {
        getById,
        updateSession,
        closeSession,
        loading: sessionLoading
    } = ClassesSessions();

    // Estados
    const [reportData, setReportData] = useState(null);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [existingAttendances, setExistingAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [sortBy, setSortBy] = useState("nome");
    const [sortOrder, setSortOrder] = useState("asc");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [actionType, setActionType] = useState("");

    // Usar hook do Modal
    const { modalConfig, showModal, hideModal, handleConfirm } = useModal();

    // Carregar dados da sessão quando o ID mudar
    useEffect(() => {
        if (id) {
            loadSessionData();
        }
    }, [id]);

    const loadSessionData = async () => {
        setLoading(true);
        try {
            // Carregar informações da sessão
            const sessionResult = await getById(id);
            if (sessionResult.success) {
                setSessionInfo(sessionResult.data);
                setEditForm({
                    name: sessionResult.data.name,
                    date: sessionResult.data.date.split('T')[0]
                });
            } else {
                showToast(sessionResult.message || "Erro ao carregar sessão", "error");
                return;
            }

            // Carregar relatório completo
            const reportResult = await getFullReportBySession(id);
            if (reportResult.success) {
                setReportData(reportResult.data);
            } else {
                showToast(reportResult.message || "Erro ao carregar presenças", "error");
            }

            // Carregar attendances existentes
            const attendancesResult = await getBySession(id);
            if (attendancesResult.success) {
                setExistingAttendances(attendancesResult.data);
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showToast("Erro ao carregar dados da sessão", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (text, type = "info") => {
        setMessage({ text, type });
    };

    // Processar dados combinados para tabela
    const allStudents = useMemo(() => {
        if (!reportData) return [];

        const presentes = reportData.presentes?.map(student => ({
            ...student,
            status: "presente",
            studentId: student.id,
            horario: student.horario ? new Date(student.horario).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }) : "-"
        })) || [];

        const ausentes = reportData.ausentes?.map(student => ({
            ...student,
            status: "ausente",
            studentId: student.id,
            horario: "-"
        })) || [];

        const atrasados = reportData.atrasados?.map(student => ({
            ...student,
            status: "atrasado",
            studentId: student.id,
            horario: student.horario ? new Date(student.horario).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }) : "-"
        })) || [];

        return [...presentes, ...atrasados, ...ausentes];
    }, [reportData]);

    // Ordenar estudantes
    const sortedStudents = useMemo(() => {
        return [...allStudents].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === "horario") {
                if (aValue === "-") aValue = "23:59:59";
                if (bValue === "-") bValue = "23:59:59";
            }

            if (sortOrder === "asc") {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
    }, [allStudents, sortBy, sortOrder]);

    // Encontrar attendance ID para um aluno
    const findAttendanceIdForStudent = (studentId) => {
        const attendance = existingAttendances.find(
            a => a.student?._id === studentId || a.student?.id === studentId
        );
        return attendance?._id || attendance?.id;
    };

    // Funções para marcar status
    const markAsPresent = async (student) => {
        try {
            const attendanceId = findAttendanceIdForStudent(student.studentId);

            if (attendanceId) {
                // Se já existe uma attendance, deletar primeiro
                await deleteAttendance(attendanceId);
            }

            const attendanceData = {
                studentId: student.studentId,
                classSessionId: id,
                status: "presente"
            };

            const result = await createManual(attendanceData);

            if (result.success) {
                showToast(`${student.nome} marcado como presente`, "success");
                loadSessionData();
            } else {
                showToast(result.message || "Erro ao marcar presença", "error");
            }
        } catch (error) {
            console.error("Erro:", error);
            showToast("Erro ao processar ação", "error");
        }
    };

    const markAsLate = async (student) => {
        try {
            const attendanceId = findAttendanceIdForStudent(student.studentId);

            if (attendanceId) {
                // Se já existe uma attendance, deletar primeiro
                await deleteAttendance(attendanceId);
            }

            const attendanceData = {
                studentId: student.studentId,
                classSessionId: id,
                status: "atrasado"
            };

            const result = await createManual(attendanceData);

            if (result.success) {
                showToast(`${student.nome} marcado como atrasado`, "success");
                loadSessionData();
            } else {
                showToast(result.message || "Erro ao marcar atrasado", "error");
            }
        } catch (error) {
            console.error("Erro:", error);
            showToast("Erro ao processar ação", "error");
        }
    };

    const markAsAbsent = async (student) => {
        try {
            const attendanceId = findAttendanceIdForStudent(student.studentId);

            if (!attendanceId) {
                showToast("Não foi encontrada uma presença para este aluno", "warning");
                return;
            }

            const result = await deleteAttendance(attendanceId);

            if (result.success) {
                showToast(`${student.nome} marcado como ausente`, "success");
                loadSessionData();
            } else {
                showToast(result.message || "Erro ao marcar ausente", "error");
            }
        } catch (error) {
            console.error("Erro:", error);
            showToast("Erro ao processar ação", "error");
        }
    };

    // Ações em massa
    const handleBulkAction = async () => {
        if (!selectedStudents.length || !actionType) return;

        setLoading(true);
        try {
            for (const studentId of selectedStudents) {
                const student = allStudents.find(s => s.studentId === studentId);
                if (!student) continue;

                switch (actionType) {
                    case "presente":
                        await markAsPresent(student);
                        break;
                    case "atrasado":
                        await markAsLate(student);
                        break;
                    case "ausente":
                        await markAsAbsent(student);
                        break;
                }
            }
            setSelectedStudents([]);
            showToast(`${selectedStudents.length} aluno(s) atualizado(s)`, "success");
        } catch (error) {
            showToast("Erro ao processar ação em massa", "error");
        } finally {
            setLoading(false);
        }
    };

    // Atualizar informações da sessão
    const handleUpdateSession = async () => {
        try {
            const result = await updateSession(id, {
                name: editForm.name,
                date: editForm.date
            });

            if (result.success) {
                setIsEditing(false);
                setSessionInfo(result.data);
                showToast("Informações atualizadas com sucesso", "success");
            }
        } catch (error) {
            showToast("Erro ao atualizar informações", "error");
        }
    };

    // Fechar sessão - AGORA COM MODAL
    const handleCloseSession = () => {
        showModal({
            title: "Fechar Sessão",
            message: "Tem certeza que deseja fechar esta sessão? Não será possível adicionar mais presenças após o fechamento.",
            type: "warning",
            confirmText: "Fechar Sessão",
            cancelText: "Cancelar",
            onConfirm: async () => {
                try {
                    const result = await closeSession(id);
                    if (result.success) {
                        setSessionInfo(prev => ({ ...prev, status: "closed" }));
                        showToast("Sessão fechada com sucesso", "success");
                        loadSessionData();
                    } else {
                        showToast(result.message || "Erro ao fechar sessão", "error");
                    }
                } catch (error) {
                    showToast("Erro ao fechar sessão", "error");
                }
            }
        });
    };

    const redirectToSubjectReport = () => {
        if (!sessionInfo) return;
        const classId = sessionInfo.class?._id || sessionInfo.class?.id;
        const subjectCode = sessionInfo.subjectCode;
        window.location.href = `/reports/${classId}/${subjectCode}`;
    };

    // Exportar relatório
    const exportReport = () => {
        if (!reportData) return;

        const csvContent = [
            ['Nome', 'Matrícula', 'Status', 'Horário'],
            ...sortedStudents.map(student => [
                student.nome,
                student.matricula,
                student.status,
                student.horario
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `presencas-${sessionInfo?.name || 'sessao'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Relatório exportado com sucesso", "success");
    };

    // Handlers
    const handleEditChange = (field, value) => {
        if (field === 'isEditing') {
            setIsEditing(value);
        } else {
            setEditForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSortChange = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    const handleToggleSelectAll = () => {
        if (selectedStudents.length === sortedStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(sortedStudents.map(s => s.studentId));
        }
    };

    const handleToggleStudentSelection = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleActionTypeChange = (e) => {
        setActionType(e.target.value);
    };

    // Estatísticas
    const stats = useMemo(() => {
        if (!reportData) return null;

        const present = reportData.presentes?.length || 0;
        const absent = reportData.ausentes?.length || 0;
        const total = present + absent;
        const percentage = Math.round((present / total) * 100) || 0;

        return {
            total,
            present,
            absent,
            late: 0,
            percentage
        };
    }, [reportData]);

    if (loading || attendanceLoading || sessionLoading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                    <Loading message="Carregando dados da aula..." />
                </div>
            </Layout>
        );
    }

    if (!sessionInfo) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800 mb-4">Sessão não encontrada</div>
                        <p className="text-gray-600 mb-6">A sessão com ID {id} não existe ou você não tem permissão para acessá-la.</p>
                        <a
                            href="/class-sessions/list"
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Voltar para Sessões
                        </a>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
                {/* Cabeçalho da Página */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Controle de Presença
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {sessionInfo.name} • {new Date(sessionInfo.date).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={redirectToSubjectReport} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <FaChartBar />
                                <span>Relatório da Disciplina</span>
                            </button>
                            <button
                                onClick={exportReport}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                disabled={!sortedStudents.length}
                            >
                                <FiDownload />
                                <span>Exportar CSV</span>
                            </button>
                            {
                                sessionInfo.status !== 'closed' && (
                                    <button
                                        onClick={loadSessionData}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <FiRefreshCw />
                                        <span>Atualizar</span>
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>

                {/* Informações da Sessão */}
                {sessionInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200"
                    >
                        <SessionHeader
                            sessionInfo={sessionInfo}
                            isEditing={isEditing}
                            editForm={editForm}
                            onEditChange={handleEditChange}
                            onSave={handleUpdateSession}
                            onCancelEdit={() => setIsEditing(false)}
                            onCloseSession={handleCloseSession}
                        />

                        {/* Estatísticas */}
                        <StatsCards stats={stats} sessionInfo={sessionInfo} />
                    </motion.div>
                )}

                {/* Controles de Ação em Massa */}
                {allStudents.length > 0 && sessionInfo.status !== 'closed' && (
                    <BulkActions
                        selectedStudents={selectedStudents}
                        totalStudents={sortedStudents.length}
                        actionType={actionType}
                        onSelectAll={handleToggleSelectAll}
                        onActionTypeChange={handleActionTypeChange}
                        onApplyBulkAction={handleBulkAction}
                    />
                )}

                {/* Tabela de Alunos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                >
                    {sortedStudents.length > 0 ? (
                        <>
                            <StudentsTable
                                sessionInfo={sessionInfo}
                                sortedStudents={sortedStudents}
                                selectedStudents={selectedStudents}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onToggleSelectAll={handleToggleSelectAll}
                                onSortChange={handleSortChange}
                                onToggleStudentSelection={handleToggleStudentSelection}
                                onMarkPresent={markAsPresent}
                                onMarkLate={markAsLate}
                                onMarkAbsent={markAsAbsent}
                            />

                            {/* Rodapé da tabela */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Total de alunos: <span className="font-semibold">{sortedStudents.length}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <FiUsers />
                                        <span>
                                            Sessão: {sessionInfo.name} • {sessionInfo.status === 'open' ? 'Aberta' : 'Fechada'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <FiUsers className="text-gray-300 text-4xl mx-auto mb-4" />
                            <p className="text-gray-500">Nenhum aluno encontrado para esta sessão.</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Toast */}
            <Toast
                message={message.text}
                type={message.type}
                onClose={() => setMessage({ text: "", type: "" })}
            />

            {/* Modal */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={hideModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                onConfirm={handleConfirm}
                showCancel={modalConfig.showCancel}
                showConfirm={modalConfig.showConfirm}
            />
        </Layout>
    );
}