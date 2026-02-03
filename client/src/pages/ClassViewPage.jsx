import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import useClasses from "../hooks/useClasses.jsx";

export default function ClassViewPage() {
  const { id: classCode } = useParams();
  const [classDetails, setClassDetails] = useState(null);
  const { students, loading, error, getStudents, getById } = useClasses();

  // Usar useEffect corretamente com todas as dependências
  useEffect(() => {
    if (classCode) {
      getStudents(classCode);
    }
  }, [classCode, getStudents]);

  const fetchClassDetails = async () => {
    if (classCode) {
      const response = await getById(classCode);
      if (!response.success) {
        console.error("Erro ao carregar detalhes da turma:", response.message);
      } else {
        console.log("Detalhes da turma carregados:", response.data);
        setClassDetails(response.data);
      }
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [classCode]);

  // Componente simples sem estado interno complexo
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800">Erro</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Cabeçalho Simples */}
        {classDetails && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Alunos da Turma {classDetails.course}
            </h1>
            <div className="text-gray-600">
            <span className="font-medium">Código:</span> {classDetails.code || "—"}
          </div>
        </div>
        )}
        {/* Lista de Alunos */}
        {students.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Nenhum aluno encontrado para esta turma.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Cabeçalho da Lista */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Alunos</h2>
                <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                  {students.length} alunos
                </span>
              </div>
            </div>

            {/* Lista */}
            <div className="divide-y divide-gray-200">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">
                    {student.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Matrícula: {student.registration}
                  </div>
                  {student.email && (
                    <div className="text-sm text-gray-500 mt-1">
                      {student.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}