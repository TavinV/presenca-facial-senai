import CameraCapture from "../../src/components/ui/CameraCapture";
import useAttendances from "../hooks/useAttendances";
import Layout from "../components/layout/Layout";
import { useState } from "react";

export default function FacialAttendancePage() {
  const { createFacial } = useAttendances();
  const [loading, setLoading] = useState(false);

  async function handleCapture({ file, totemApiKey }) {
    try {
      setLoading(true);

      const result = await createFacial(file, totemApiKey);

      if (!result.success) {
        throw new Error(result.message);
      }

      alert("Presença registrada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao reconhecer o rosto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h2>Reconhecimento Facial</h2>

      {loading && <p>Processando reconhecimento...</p>}

      <CameraCapture onCapture={handleCapture} />
    </Layout>
  );
}
