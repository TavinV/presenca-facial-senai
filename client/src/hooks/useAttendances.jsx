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
      console.log("Totem API Key:", totemApiKey);

      const response = await attendancesApi.createFacial(formData, {"x-totem-api-key": totemApiKey});
      console.log("Resposta do createFacial:", response);
      const { success, data, message } = response;
      const student = data?.student;
      if (success) {
        return { success: true, data };
      }
      
      setError(message);
      return { success: false, message };
    } catch (err) {
      const message =
        err?.message || "Erro no reconhecimento facial";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    attendances,
    loading,
    error,
    createManual,
    createFacial,
  };
}
