import { useState, useCallback } from "react";
import { studentsApi } from "../api/students";

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar todos os alunos
  const loadStudents = useCallback(
    async ({ page: p = 1, limit: l = 10 } = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await studentsApi.getAll({ page: p, limit: l });

        if (response.success) {
          if (Array.isArray(response.data)) {
            setStudents(response.data);
            setPage(1);
            setLimit(response.data.length || l);
            setTotalPages(1);
          } else if (Array.isArray(response.data?.data)) {
            setStudents(response.data.data);
            setPage(response.data.page || p);
            setLimit(response.data.limit || l);
            setTotalPages(response.data.totalPages || 1);
          } else {
            setStudents([]);
            setPage(p);
            setLimit(l);
            setTotalPages(1);
          }
        } else {
          setError(response.message || "Erro ao carregar alunos");
        }
      } catch (err) {
        setError(err.message || "Erro ao carregar alunos");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Carregar alunos por turma
  const loadStudentsByClass = useCallback(async (classCode) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.getByClass(classCode);

      if (response.success) {
        setStudents(
          Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.data)
              ? response.data.data
              : [],
        );
      } else {
        setError(response.message || "Erro ao carregar alunos");
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar alunos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo aluno
  const createStudent = useCallback(async (studentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.create(studentData);

      if (response.success) {
        setStudents((prev) => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao criar aluno";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar aluno
  const updateStudent = useCallback(async (id, studentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.update(id, studentData);

      if (response.success) {
        setStudents((prev) =>
          prev.map((student) => (student._id === id ? response.data : student)),
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao atualizar aluno";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Excluir aluno
  const deleteStudent = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.delete(id);

      if (response.success) {
        setStudents((prev) => prev.filter((student) => student._id !== id));
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao excluir aluno";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Processar imagem facial
  const encodeFace = useCallback(async (imageFile) => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsApi.encodeFace(imageFile);
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Erro ao processar imagem facial";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar imagem
  const validateImage = useCallback((file) => {
    return studentsApi.validateImage(file);
  }, []);

  // Atualizar facialId do aluno (endpoint separado)
  const updateFacialId = useCallback(async (id, facialEmbedding, nonce) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.updateFacialId(id, facialEmbedding, nonce);
      if (response.success) {
        // optionally update local student
        setStudents((prev) =>
          prev.map((s) => (s._id === id ? response.data : s)),
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Erro ao atualizar facialId");
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao atualizar facialId";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar alunos
  const filterStudents = useCallback((studentsList, filters = {}) => {
    let filtered = [...studentsList];

    const { classCode, searchTerm, isActive } = filters;

    if (classCode && classCode !== "all") {
      filtered = filtered.filter((student) =>
        student.classes?.includes(classCode),
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.registration.toLowerCase().includes(term),
      );
    }

    if (isActive !== undefined) {
      filtered = filtered.filter((student) => student.isActive === isActive);
    }

    return filtered;
  }, []);

  // Obter aluno por id (para edição)
  const getStudent = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.getById(id);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Erro ao obter aluno");
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao obter aluno";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estado
    students,
    page,
    limit,
    totalPages,
    loading,
    error,

    // Ações
    loadStudents,
    loadStudentsByClass,
    createStudent,
    updateStudent,
    deleteStudent,
    encodeFace,
    validateImage,
    filterStudents,
    getStudent,
    updateFacialId,

    // Utilitários
    clearError: () => setError(null),
    setStudents,
  };
}
