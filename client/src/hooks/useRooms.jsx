import { useState, useCallback } from "react";
import { roomsApi } from "../api/rooms";

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar todas as salas fisícas
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsApi.getAll();
      if (response.success) {
        setRooms(response.data || []);
      } else {
        setError(response.message || "Erro ao carregar salas");
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar salas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Editar uma sala física
  const editRoom = useCallback(async (id, roomData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsApi.update(id, roomData);
      if (response.success) {
        // Atualiza a sala na lista local
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === id || room._id === id ? response.data : room
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Erro ao editar sala");
        return {
          success: false,
          message: response.message || "Erro ao editar sala",
        };
      }
    } catch (err) {
      setError(err.message || "Erro ao editar sala");
      return { success: false, message: err.message || "Erro ao editar sala" };
    } finally {
      setLoading(false);
    }
  });

  // Deletar uma sala física
  const deleteRoom = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsApi.delete(id);
      
      if (response.success === false) {
        setError(response.message || "Erro ao deletar sala");
        return {
          success: false,
          message: response.message || "Erro ao deletar sala",
        };
      } else {
        // Remove a sala da lista local
        setRooms((prevRooms) =>
          prevRooms.filter((room) => !(room.id === id || room._id === id))
      );
      return { success: true };
      }
    } catch (err) {
      setError(err.message || "Erro ao deletar sala");
      return { success: false, message: err.message || "Erro ao deletar sala" };
    } finally {
      setLoading(false);
    }
  });

  // Criar uma sala física
  const createRoom = useCallback(async (roomData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsApi.create(roomData);

      if (response.success) {
        const created = response.data;
        setRooms((prev) => [created, ...prev]);
        return { success: true, data: created };
        
      } else {
        setError(response.message || "Erro ao criar sala");
        return {
          success: false,
          message: response.message || "Erro ao criar sala",
        };
      }
    } catch (err) {
      setError(err.message || "Erro ao criar sala");
      return { success: false, message: err.message || "Erro ao criar sala" };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rooms,
    loading,
    error,
    loadRooms,
    editRoom,
    deleteRoom,
    createRoom,
  };
}
