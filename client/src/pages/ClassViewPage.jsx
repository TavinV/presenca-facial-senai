import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import useClasses from "../hooks/useClasses.jsx";
import { ClassHeader } from "../components/students/ClassHeader.jsx";
import { StudentList } from "../components/students/StudentList.jsx";
import { AddStudentModal } from "../components/students/AddStudentModal.jsx";

export default function ClassViewPage() {
  const { id: classCode } = useParams();
  const [classDetails, setClassDetails] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingStudent, setAddingStudent] = useState(null);
  const [removingStudent, setRemovingStudent] = useState(null);

  const {
    students: classStudents,
    loading: classesLoading,
    error: classesError,
    getStudents,
    getById,
    addStudent,
    removeStudent
  } = useClasses();

  useEffect(() => {
    if (classCode) {
      // Carregar alunos da turma
      getStudents(classCode);
      // Carregar detalhes da turma
      loadClassDetails();
    }
  }, [classCode]);

  const loadClassDetails = async () => {
    const response = await getById(classCode);
    if (response.success) {
      setClassDetails(response.data);
    }
  };

  const handleAddStudent = async (classId, studentId) => {
    setAddingStudent(studentId);
    try {
      const response = await addStudent(classId, studentId);
      if (response.success) {
        // Recarregar lista de alunos
        await getStudents(classCode);
      }
      return response;
    } finally {
      setAddingStudent(null);
    }
  };

  const handleRemoveStudent = async (classId, studentId) => {
    setRemovingStudent(studentId);
    try {
      const response = await removeStudent(classId, studentId);
      if (response.success) {
        // Recarregar lista de alunos
        await getStudents(classCode);
      }
      return response;
    } finally {
      setRemovingStudent(null);
    }
  };

  // Para paginação, ajuste conforme a API
  const hasMoreStudents = false; // Defina baseado na resposta da API

  if (classesLoading && !classStudents.length && !classDetails) {
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

  if (classesError) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800">Erro</h2>
            <p className="text-red-700">{classesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <ClassHeader
          classDetails={classDetails}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          loading={classesLoading && !classDetails}
        />

        <StudentList
          students={classStudents}
          onRemoveStudent={handleRemoveStudent}
          loading={classesLoading && classStudents.length === 0}
          classCode={classCode}
          hasMore={hasMoreStudents}
          onLoadMore={() => getStudents(classCode)}
          addingStudent={addingStudent}
          removingStudent={removingStudent}
        />

        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddStudent={handleAddStudent}
          classCode={classCode}
          existingStudents={classStudents}
        />
      </div>
    </Layout>
  );
}