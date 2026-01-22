import { useCallback, useState } from "react";
import { usersApi } from "../api/users";

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Exibir os usuários cadastrados
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getAll();

      if (response.success) {
        setUsers(response.data || []);
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
      if (response.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        return { success: true };
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

  const teachers = users.filter((u) => u.role === "professor");

  return {
    // Estado
    users,
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
