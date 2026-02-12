import { useState, useCallback } from "react";
import { totemsApi } from "../api/totems";

export function useTotems() {
  const [totems, setTotems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Carregar todos
  const loadTotems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await totemsApi.getAll();

      if (response.success) {
        setTotems(response.data || []);
      } else {
        setError(response.message || "Erro ao carregar totems");
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar totems");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Criar
  const createTotem = useCallback(async (totemData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await totemsApi.create(totemData);

      if (response.success) {
        const created = response.data;
        setTotems((prev) => [created, ...prev]);

        return { success: true, data: created };
      } else {
        setError(response.message || "Erro ao criar totem");
        return {
          success: false,
          message: response.message || "Erro ao criar totem",
        };
      }
    } catch (err) {
      setError(err.message || "Erro ao criar totem");
      return {
        success: false,
        message: err.message || "Erro ao criar totem",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Atualizar
  const updateTotem = useCallback(async (id, totemData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await totemsApi.update(id, totemData);

      if (response.success) {
        const updated = response.data;

        setTotems((prev) =>
          prev.map((totem) =>
            totem.id === id || totem._id === id ? updated : totem,
          ),
        );

        return { success: true, data: updated };
      } else {
        setError(response.message || "Erro ao atualizar totem");
        return {
          success: false,
          message: response.message || "Erro ao atualizar totem",
        };
      }
    } catch (err) {
      setError(err.message || "Erro ao atualizar totem");
      return {
        success: false,
        message: err.message || "Erro ao atualizar totem",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Ativar / Desativar
  const toggleTotemStatus = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await totemsApi.toggleStatus(id);

      if (response.success) {
        setTotems((prev) =>
          prev.map((totem) =>
            totem.id === id || totem._id === id
              ? { ...totem, isActive: !totem.isActive }
              : totem,
          ),
        );

        return { success: true };
      } else {
        setError(response.message || "Erro ao alterar status");
        return {
          success: false,
          message: response.message || "Erro ao alterar status",
        };
      }
    } catch (err) {
      setError(err.message || "Erro ao alterar status");
      return {
        success: false,
        message: err.message || "Erro ao alterar status",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Deletar
  const deleteTotem = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await totemsApi.delete(id);

      if (response.success === false) {
        setError(response.message || "Erro ao deletar totem");
        return {
          success: false,
          message: response.message || "Erro ao deletar totem",
        };
      }

      setTotems((prev) =>
        prev.filter((totem) => !(totem.id === id || totem._id === id)),
      );

      return { success: true };
    } catch (err) {
      setError(err.message || "Erro ao deletar totem");
      return {
        success: false,
        message: err.message || "Erro ao deletar totem",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Pegar API Key
  const getApiKey = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await totemsApi.getApiKey(id);

      if (response.success) {
        return { success: true, apiKey: response.data.apiKey };
      } else {
        setError(response.message || "Erro ao obter API Key");
        return {
          success: false,
          message: response.message || "Erro ao obter API Key",
        };
      }
    } catch (err) {
      setError(err.message || "Erro ao obter API Key");
      return {
        success: false,
        message: err.message || "Erro ao obter API Key",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Regenerar API Key
  const regenerateApiKey = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await totemsApi.regenerateApiKey(id);

      if (response.success) {
        return { success: true, apiKey: response.data.apiKey };
      } else {
        setError(response.message || "Erro ao regenerar API Key");
        return {
          success: false,
          message: response.message || "Erro ao regenerar API Key",
        };
      }
    } catch (err) {
      setError(err.message || "Erro ao regenerar API Key");
      return {
        success: false,
        message: err.message || "Erro ao regenerar API Key",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estado
    totems,
    loading,
    error,

    // Ações
    loadTotems,
    createTotem,
    updateTotem,
    toggleTotemStatus,
    deleteTotem,
    getApiKey,
    regenerateApiKey,
  };
}
