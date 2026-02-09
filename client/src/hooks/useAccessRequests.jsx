import { useState, useCallback } from "react";
import { accessRequestApi } from "../api/accessRequest";
import { usersApi } from "../api/users";

export default function useAccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accessRequestApi.create(payload);
      if (response.success) {
        setRequests((prev) => [response.data, ...prev]);
        return { success: true, data: response.data };
      }
      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao criar solicitação";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accessRequestApi.getAll();
      if (response.success) {
        setRequests(response.data || []);
        return { success: true, data: response.data || [] };
      }
      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao carregar solicitações";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accessRequestApi.updateStatus(id, { status });
      if (response.success) {
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? response.data : r)),
        );
        return { success: true, data: response.data };
      }
      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao atualizar status";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await accessRequestApi.delete(id);
      
      if (response?.success === false) {
        setError(response.message);
        return { success: false, message: response.message };
      } else {
        setRequests((prev) => prev.filter((r) => r._id !== id && r.id !== id));
        return { success: true };
      }
    } catch (err) {
      const message = err.message || "Erro ao remover solicitação";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createUserFromRequest = useCallback(async (accessRequestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.create({ accessRequestId });
      if (response.success) return { success: true, data: response.data };
      setError(response.message);
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.message || "Erro ao criar usuário";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    requests,
    loading,
    error,
    create,
    getAll,
    updateStatus,
    remove,
    createUserFromRequest,
  };
}
