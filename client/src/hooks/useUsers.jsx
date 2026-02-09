import { useCallback, useState } from "react";
import { usersApi } from "../api/users";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Exibir os usuários cadastrados
  const loadUsers = useCallback(async ({ page: p = 1, limit: l = 10 } = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getAll({ page: p, limit: l });

      if (response.success) {
        if (Array.isArray(response.data)) {
          setUsers(response.data);
          setPage(1);
          setLimit(response.data.length || l);
          setTotalPages(1);
        } else if (Array.isArray(response.data?.data)) {
          setUsers(response.data.data);
          setPage(response.data.page || p);
          setLimit(response.data.limit || l);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setUsers([]);
          setPage(p);
          setLimit(l);
          setTotalPages(1);
        }
      } else {
        setError(response.message || "Erro ao carregar usuários");
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar um novo usuário
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.create(userData);
      if (response.success) {
        setUsers((prev) => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  });

  // Editar o usuário
  const updateUser = useCallback(async (id, userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.update(id, userData);
      if (response.success) {
        setUsers((prev) => prev.map((u) => (u._id === id ? response.data : u)));
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  });

  // Deletar o usuário
  const deleteUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.delete(id);
      if (response?.success === false) {
        setError(response.message);
        return { success: false, message: response.message };
      } else {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  });

  // Obter usuário por id
  const getUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getById(id);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Erro ao obter usuário");
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message || "Erro ao obter usuário");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Ativar usuário
  const activateUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.activate(id);
      if (response.success) {
        setUsers((prev) => prev.map((u) => (u._id === id ? response.data : u)));
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Erro ao ativar usuário");
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message || "Erro ao ativar usuário");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Desativar usuário
  const deactivateUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.deactivate(id);
      if (response.success) {
        setUsers((prev) => prev.map((u) => (u._id === id ? response.data : u)));
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Erro ao desativar usuário");
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError(err.message || "Erro ao desativar usuário");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const teachers = (Array.isArray(users) ? users : []).filter(
    (u) => u.role === "professor",
  );

  return {
    // Estado
    users,
    page,
    limit,
    totalPages,
    teachers,
    loading,
    error,

    // Ações
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    getUser,
    activateUser,
    deactivateUser,
  };
}
