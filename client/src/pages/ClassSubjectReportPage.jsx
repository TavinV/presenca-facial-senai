import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Loading from "../components/ui/Loading";
import Toast from "../components/ui/Toast";
import useAttendances from "../hooks/useAttendances";
import {
    FaChartBar,
    FaUsers,
    FaUserGraduate,
    FaCalendarAlt,
    FaArrowLeft,
    FaClipboardCheck,
    FaExclamationTriangle,
    FaPercentage,
    FaClock,
    FaTimesCircle,
    FaCheckCircle,
    FaFileExport,
    FaBook,
    FaIdCard,
} from "react-icons/fa";

export default function ClassSubjectReportPage() {
    const { classid, subjectCode } = useParams();
    const navigate = useNavigate();
    const { getTableByClassAndSubject, loading, error } = useAttendances();

    const [reportData, setReportData] = useState(null);
    const [message, setMessage] = useState({ text: "", type: "" });
    useEffect(() => {
        if (classid && subjectCode) {
            loadReportData();
        }
    }, [classid, subjectCode]);

    const loadReportData = async () => {
        try {
            const result = await getTableByClassAndSubject(classid, subjectCode);

            if (result.success) {
                setReportData(result.data);
            } else {
                showToast(result.message || "Erro ao carregar relatório", "error");
            }
        } catch (err) {
            showToast("Erro ao carregar dados do relatório", "error");
        }
    };

    const showToast = (text, type = "info") => {
        setMessage({ text, type });
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleExport = () => {
        if (!reportData || !reportData.alunos || reportData.alunos.length === 0) {
            showToast("Não há dados para exportar", "warning");
            return;
        }

        const csvContent = [
            ['Nome', 'Matrícula', 'Faltas', 'Atrasos', 'Frequência (%)', 'Presenças', 'Total Aulas'],
            ...reportData.alunos.map(aluno => [
                aluno.aluno,
                aluno.matricula,
                aluno.faltas,
                aluno.atrasos,
                aluno.frequencia,
                reportData.totalAulas - aluno.faltas,
                reportData.totalAulas
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio-${subjectCode}-${classid}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Relatório exportado com sucesso", "success");
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                    <Loading message="Carregando relatório..." />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center">
                            <FaExclamationTriangle className="text-red-600 mr-3 text-xl" />
                            <div>
                                <h3 className="font-bold text-red-800 text-lg">Erro ao carregar relatório</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleBack}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <FaArrowLeft className="inline mr-2" />
                            Voltar
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!reportData) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
                    <div className="text-center py-12">
                        <FaChartBar className="text-gray-300 text-6xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Nenhum dado disponível
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Não foi possível carregar o relatório para esta turma e disciplina.
                        </p>
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <FaArrowLeft className="inline mr-2" />
                            Voltar
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Calcular estatísticas gerais
    const totalAlunos = reportData.alunos.length;
    const totalFaltas = reportData.alunos.reduce((sum, aluno) => sum + aluno.faltas, 0);
    const totalAtrasos = reportData.alunos.reduce((sum, aluno) => sum + aluno.atrasos, 0);
    const mediaFrequencia = reportData.alunos.length > 0
        ? (reportData.alunos.reduce((sum, aluno) => sum + aluno.frequencia, 0) / reportData.alunos.length).toFixed(1)
        : 0;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
                {/* Cabeçalho da Página */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                            >
                                <FaArrowLeft className="mr-2" />
                                Voltar
                            </button>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <FaChartBar className="text-red-600 mr-3" />
                                Relatório de Frequência
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                <div className="flex items-center text-gray-600">
                                    <FaBook className="mr-2" />
                                    <span className="font-medium">Disciplina:</span>
                                    <span className="ml-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {reportData.subjectCode}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <FaUsers className="mr-2" />
                                    <span className="font-medium">Turma:</span>
                                    <span className="ml-2">{classid}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleExport}
                                disabled={!reportData.alunos || reportData.alunos.length === 0}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaFileExport />
                                <span>Exportar CSV</span>
                            </button>
                        </div>
                    </div>

                    {/* Cartões de Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    <FaCalendarAlt className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">
                                        {reportData.totalAulas}
                                    </div>
                                    <div className="text-sm text-gray-500">Total de Aulas</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-lg mr-4">
                                    <FaUsers className="text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">
                                        {totalAlunos}
                                    </div>
                                    <div className="text-sm text-gray-500">Alunos</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="bg-red-100 p-3 rounded-lg mr-4">
                                    <FaTimesCircle className="text-red-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">
                                        {totalFaltas}
                                    </div>
                                    <div className="text-sm text-gray-500">Faltas Totais</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                    <FaPercentage className="text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">
                                        {mediaFrequencia}%
                                    </div>
                                    <div className="text-sm text-gray-500">Média de Frequência</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Alunos */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <FaClipboardCheck className="text-red-600 mr-3" />
                            Desempenho dos Alunos
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                            Frequência individual por aluno na disciplina {reportData.subjectCode}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <FaUserGraduate className="mr-2" />
                                            Aluno
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <FaIdCard className="mr-2" />
                                            Matrícula
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <FaTimesCircle className="mr-2" />
                                            Faltas
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <FaClock className="mr-2" />
                                            Atrasos
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <FaPercentage className="mr-2" />
                                            Frequência
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <FaCheckCircle className="mr-2" />
                                            Presenças
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reportData.alunos.map((aluno, index) => {
                                    const presencas = reportData.totalAulas - aluno.faltas;
                                    const status = aluno.frequencia >= 75 ? "regular" : aluno.frequencia >= 50 ? "atenção" : "crítico";

                                    return (
                                        <tr
                                            key={`${aluno.matricula}-${index}`}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {aluno.aluno}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {aluno.matricula}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${aluno.faltas === 0
                                                        ? "bg-green-100 text-green-800"
                                                        : aluno.faltas <= 2
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {aluno.faltas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${aluno.atrasos === 0
                                                        ? "bg-green-100 text-green-800"
                                                        : aluno.atrasos <= 2
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-orange-100 text-orange-800"
                                                    }`}>
                                                    {aluno.atrasos}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                                                        <div
                                                            className={`h-2.5 rounded-full ${aluno.frequencia >= 75
                                                                    ? "bg-green-600"
                                                                    : aluno.frequencia >= 50
                                                                        ? "bg-yellow-500"
                                                                        : "bg-red-600"
                                                                }`}
                                                            style={{ width: `${Math.min(aluno.frequencia, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`font-medium ${aluno.frequencia >= 75
                                                            ? "text-green-700"
                                                            : aluno.frequencia >= 50
                                                                ? "text-yellow-700"
                                                                : "text-red-700"
                                                        }`}>
                                                        {aluno.frequencia}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-700 font-medium">
                                                    {presencas} / {reportData.totalAulas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status === "regular"
                                                        ? "bg-green-100 text-green-800"
                                                        : status === "atenção"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {status === "regular" ? "Regular" : status === "atenção" ? "Atenção" : "Crítico"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Rodapé da Tabela */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-600">
                                Mostrando <span className="font-semibold">{reportData.alunos.length}</span> alunos
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                                    <span>≥ 75% (Regular)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                    <span>50-74% (Atenção)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                                    <span>&lt; 50% (Crítico)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            

                {/* Toast */}
                <Toast
                    message={message.text}
                    type={message.type}
                    onClose={() => setMessage({ text: "", type: "" })}
                />
            </div>
        </Layout>
    );
}