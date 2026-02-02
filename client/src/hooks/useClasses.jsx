import { useState, useCallback } from "react";
import { classesApi } from "../api/classes";

export default function useClasses() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Exibir as turmas cadastradas
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.getAll();

      if (response.success) {
        setClasses(response.data || []);
      } else {
        setError(response.message || "Erro ao carregar turmas");
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar turmas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Exibir as turmas do professor logado
  const loadMyClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.getMyClasses();

      if (response.success) {
        setClasses(response.data || []);
      } else {
        setError(response.message || "Erro ao carregar turmas");
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar turmas");
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.getById(id);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Erro ao carregar turma");
        return { success: false, message: response.message || "Erro ao carregar turma" };
      }
    } catch (err) {
      const message = err.message || "Erro ao carregar turma";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova turma
  const createClass = useCallback(async (classData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.create(classData);

      if (response.success) {
        setClasses((prev) => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao criar turma";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar turma
  const deleteClass = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.delete(id);

      if (response.success) {
        setClasses((prev) =>
          prev.filter((cls) => cls.id !== id && cls._id !== id)
        );
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao deletar turma";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  //Atualizar turma
  const updateClass = useCallback(async (id, classData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.update(id, classData);
      if (response.success) {
        setClasses((prev) =>
          prev.map((cls) => (cls._id === id ? response.data : cls))
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao atualizar turma";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Selecionar professor na turma
  const addTeacher = useCallback(async (classId, teacherId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.addTeacher(classId, teacherId);

      if (response.success) {
        setClasses((prev) =>
          prev.map((cls) =>
            cls.id === classId || cls._id === classId
              ? { ...cls, teachers: [...(cls.teachers || []), response.data] }
              : cls
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao adicionar professor";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remover professor da turma
  const removeTeacher = useCallback(async (classId, teacherId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.removeTeacher(classId, teacherId);

      if (response.success) {
        setClasses((prev) =>
          prev.map((cls) =>
            cls.id === classId || cls._id === classId
              ? {
                  ...cls,
                  teachers: (cls.teachers || []).filter(
                    (t) => (t._id || t.id) !== teacherId
                  ),
                }
              : cls
          )
        );
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao remover professor";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Selecionar salas fisicas da turma
  const addRoom = useCallback(async (classId, roomId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.addRoom(classId, roomId);
      if (response.success) {
        setClasses((prev) =>
          prev.map((cls) =>
            cls.id === classId || cls._id === classId
              ? { ...cls, rooms: [...(cls.rooms || []), response.data] }
              : cls
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao adicionar sala";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remover sala da turma
  const removeRoom = useCallback(async (classId, roomId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.removeRoom(classId, roomId);

      if (response.success) {
        setClasses((prev) =>
          prev.map((cls) =>
            cls.id === classId || cls._id === classId
              ? {
                  ...cls,
                  rooms: (cls.rooms || []).filter(
                    (r) => (r._id || r.id) !== roomId
                  ),
                }
              : cls
          )
        );
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = err.message || "Erro ao remover sala";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Exibir os alunos da turma
  const getStudents = useCallback(async (classCode) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesApi.getStudents(classCode);
      if (response.success) {
        setStudents(response.data || []);
        return { success: true, data: response.data || [] };
      } else {
        setStudents([]);
        setError(response.message || "Erro ao carregar alunos");
        return {
          success: false,
          message: response.message || "Erro ao carregar alunos",
        };
      }
    } catch (err) {
      const message = err.message || "Erro ao carregar alunos";
      setStudents([]);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    classes,
    students,
    loading,
    error,

    // Ações
    loadClasses,
    getById,
    loadMyClasses,
    createClass,
    addTeacher,
    addRoom,
    deleteClass,
    updateClass,
    getStudents,
    clearError,
    removeTeacher,
    removeRoom,
  };
}
