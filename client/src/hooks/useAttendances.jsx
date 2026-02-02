import { attendancesApi } from "../api/attendances";
import { useState, useCallback } from "react";

export default function useAttendances() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Criar presença manual
  const createManual = useCallback(async (attendancesData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendancesApi.createManual(attendancesData);

      if (response.success) {
        setAttendances((prev) => [response.data, ...prev]);
        return { success: true, data: response.data };
      }

      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao criar presença";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar presença com reconhecimento facial
  const createFacial = useCallback(async (imageFile, totemApiKey) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("image", imageFile); // OBRIGATÓRIO
      formData.append("timestamp", Date.now().toString()); // OPCIONAL

      const response = await attendancesApi.createFacial(formData, {
        "x-totem-api-key": totemApiKey,
      });
      const { success, data, message } = response;
      if (success) {
        return { success: true, data, message };
      }

      setError(message);
      return { success: false, message };
    } catch (err) {
      const message = err?.message || "Erro no reconhecimento facial";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Visualizar presenças da aula
  const getBySession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendancesApi.getBySession(sessionId);

      if (response.success) {
        const dataArray = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        setAttendances(dataArray);
        return { success: true, data: dataArray };
      }

      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao buscar presenças";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obter presença por ID
  const getById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendancesApi.getById(id);

      if (response.success) {
        return { success: true, data: response.data };
      }

      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao buscar presença";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Relatório completo da sessão
  const getFullReportBySession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendancesApi.getFullReportBySession(sessionId);

      if (response.success) {
        return { success: true, data: response.data };
      }

      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao obter relatório";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Deletar presença

  const deleteAttendance = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendancesApi.delete(id);

      setAttendances((prev) => prev.filter((a) => a._id !== id && a.id !== id));
      return { success: true };
      
    } catch (err) {
      const message = err.message || "Erro ao deletar presença";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar presença
  const update = useCallback(async (id, attendanceData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendancesApi.update(id, attendanceData);

      if (response.success) {
        setAttendances((prev) =>
          prev.map((a) => (a._id === id || a.id === id ? response.data : a)),
        );
        return { success: true, data: response.data };
      }

      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao atualizar presença";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // TABELA de presenças por turma + disciplina
  const getTableByClassAndSubject = useCallback(
    async (classId, subjectCode) => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await attendancesApi.getTableByClassAndSubject(
            classId,
            subjectCode
          );

        if (response.success) {
          return { success: true, data: response.data };
        }

        setError(response.message);
        return { success: false, message: response.message };
      } catch (err) {
        const message =
          err.message || "Erro ao carregar tabela de presenças";
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Presenças de um aluno por turma + disciplina
  const getByStudentClassAndSubject = useCallback(
    async (studentId, classId, subjectCode) => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await attendancesApi.getByStudentClassAndSubject(
            studentId,
            classId,
            subjectCode
          );

        if (response.success) {
          return { success: true, data: response.data };
        }

        setError(response.message);
        return { success: false, message: response.message };
      } catch (err) {
        const message =
          err.message || "Erro ao buscar presenças do aluno";
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );


  return {
    attendances,
    loading,
    error,
    createManual,
    deleteAttendance,
    createFacial,
    getBySession,
    getById,
    getFullReportBySession,
    getTableByClassAndSubject,
    getByStudentClassAndSubject,
    update,
  };
}
