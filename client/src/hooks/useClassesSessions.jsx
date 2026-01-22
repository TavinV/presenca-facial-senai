import { useState, useCallback } from "react";
import { classesSessionsApi } from "../api/classesSessions.js";

export default function ClassesSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadByClass = useCallback(async (classId) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await classesSessionsApi.getByClass(classId);
      setSessions(data || []);
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err.message || "Erro ao carregar sessões";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadByTeacher = useCallback(async (teacherId) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await classesSessionsApi.getByTeacher(teacherId);
      setSessions(data || []);
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err.message || "Erro ao carregar sessões";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesSessionsApi.getById(id);
      if (response.success) return { success: true, data: response.data };
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao obter sessão";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (sessionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await classesSessionsApi.create(sessionData);
      if (response.success) {
        setSessions((prev) => [response.data, ...prev]);
        return { success: true, data: response.data };
      }
      setError(response.message || "Erro ao criar sessão");
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao criar sessão";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (id, payload) => {
    try {
      setLoading(true);
      setError(null);

      const response = await classesSessionsApi.update(id, payload);

      if (response.success) {
        setSessions((prev) =>
          prev.map((s) => (s._id === id || s.id === id ? response.data : s)),
        );
        return { success: true, data: response.data };
      }

      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao atualizar sessão";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);


  const deleteSession = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await classesSessionsApi.delete(id);
      setSessions((prev) => prev.filter((s) => s._id !== id && s.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.message || "Erro ao deletar sessão";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

   const closeSession = useCallback(async (id) => {
     try {
       setLoading(true);
       setError(null);
       const { data } = await classesSessionsApi.closeSession(id);
       setSessions((prev) =>
         prev.map((s) => (s._id === id || s.id === id ? data : s))
       );
       return { success: true, data };
     } catch (err) {
       const message = err.message || "Erro ao fechar sessão";
       setError(message);
       return { success: false, message };
     } finally {
       setLoading(false);
     }
   }, []);

  return {
    sessions,
    loading,
    error,
    loadByClass,
    loadByTeacher,
    getById,
    createSession,
    updateSession,
    deleteSession,
    closeSession,
  };
}
