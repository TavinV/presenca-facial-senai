// hooks/useFacialCalibration.js
import { useState } from "react";
import facialApi from "../services/facialApi";

export function useFacialCalibration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const calibrateThreshold = async (embeddingData, threshold, imageFile) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();

      // Embedding deve ser enviado como string JSON
      formData.append("embedding", JSON.stringify(embeddingData));
      formData.append("threshold", threshold.toString());
      formData.append("image", imageFile);

      const response = await facialApi.post("/calibrate-threshold", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || "Erro na calibração";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    loading,
    error,
    result,
    calibrateThreshold,
    clearResult,
  };
}
