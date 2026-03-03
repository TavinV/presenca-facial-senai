// pages/calibration/ThresholdCalibration.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import PageHeader from "../../components/layout/PageHeader";
import FaceCapture from "../../components/students/FaceCapture";
import { FaRuler, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../hooks/useStudents";
import { useFacialCalibration } from "../../hooks/useFacialCalibration";
import PasswordProtection from "./components/PasswordProtection";
import ThresholdSlider from "./components/ThresholdSlider";
import CalibrationResultCard from "./components/CalibrationResultCard";

export default function ThresholdCalibration() {
  const navigate = useNavigate();
  const { isCoordinator } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);

  // Estados
  const [embeddingData, setEmbeddingData] = useState(null);
  const [threshold, setThreshold] = useState(0.5);
  const [testImage, setTestImage] = useState(null);
  const [step, setStep] = useState("capture-reference"); // 'capture-reference', 'capture-test', 'result'
  const [faceProcessing, setFaceProcessing] = useState(false);
  const [faceInfo, setFaceInfo] = useState(null);
  const [calibrationError, setCalibrationError] = useState(null); // Renomeado para não conflitar com o error do hook

  const { encodeFace, loading: studentsLoading } = useStudents();
  const { loading, error, result, calibrateThreshold, clearResult } =
    useFacialCalibration();

  // Se não autenticado, mostra proteção por senha
  if (!authenticated) {
    return (
      <Layout>
        <PasswordProtection onAuthenticated={() => setAuthenticated(true)} />
      </Layout>
    );
  }

  const handleReferenceCapture = async (imageBlobs) => {
    // imageBlobs é array com 3 imagens (centro, direita, esquerda)
    setFaceProcessing(true);
    setCalibrationError(null);

    try {
      const res = await encodeFace(imageBlobs);
      if (!res.success) throw new Error(res.message);

      setEmbeddingData({
        embedding: res.data.embedding,
        nonce: res.data.nonce,
        photos_processed: res.data.photos_processed || 3,
      });

      setFaceInfo({
        status: "processed",
        nonce: res.data.nonce,
        photos_processed: res.data.photos_processed || 3,
      });

      setStep("capture-test");
    } catch (err) {
      console.error("Erro no processamento facial:", err);
      setCalibrationError(err.message || "Erro ao processar rostos");
      setFaceInfo({ status: "error", message: err.message });
    } finally {
      setFaceProcessing(false);
    }
  };

  const handleTestImageCapture = (blobs) => {
    setTestImage(blobs[0]);
    setStep("result");
  };

  const handleRunTest = async () => {
    if (!embeddingData || !testImage) return;

    const res = await calibrateThreshold(embeddingData, threshold, testImage);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleNewTest = () => {
    clearResult();
    setEmbeddingData(null);
    setTestImage(null);
    setThreshold(0.5);
    setStep("capture-reference");
  };

  const handleRedoReference = () => {
    setEmbeddingData(null);
    setStep("capture-reference");
  };

  const handleRedoTest = () => {
    setTestImage(null);
    setStep("capture-test");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <PageHeader
          backTo="/dashboard"
          icon={FaRuler}
          title="Calibração de Threshold"
          subtitle="Ferramenta para testar e ajustar o threshold de reconhecimento facial"
        />

        <div className="space-y-6">
          {/* Instruções */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Como usar:</strong> Capture um rosto de referência (como
              se fosse o cadastro), depois capture uma foto simulando a
              tentativa de reconhecimento no totem, ajuste o threshold e veja o
              resultado.
            </p>
          </div>

          {/* Timeline de passos */}
          <div className="flex items-center justify-between mb-4">
            {["capture-reference", "capture-test", "result"].map((s, index) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                    step === s
                      ? "bg-red-600 text-white"
                      : index <
                          [
                            "capture-reference",
                            "capture-test",
                            "result",
                          ].indexOf(step)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index <
                      ["capture-reference", "capture-test", "result"].indexOf(
                        step,
                      )
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <h2 className="text-xl font-bold text-white">
                {step === "capture-reference" &&
                  "Passo 1: Capturar Rosto de Referência"}
                {step === "capture-test" && "Passo 2: Capturar Rosto de Teste"}
                {step === "result" && "Passo 3: Resultado da Calibração"}
              </h2>
            </div>

            <div className="p-8 space-y-8">
              {/* Passo 1: Capturar referência */}
              {step === "capture-reference" && (
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Atenção:</strong> Esta captura será usada como
                      referência (equivalente ao cadastro do aluno). Posicione o
                      rosto centralizado e com boa iluminação.
                    </p>
                  </div>

                  <FaceCapture
                    mode="multiple"
                    onCapture={handleReferenceCapture}
                    loading={studentsLoading}
                    faceInfo={null}
                    onCancel={() => navigate("/")}
                    onSuccess={() => {}}
                  />
                </div>
              )}

              {/* Passo 2: Capturar teste */}
              {step === "capture-test" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FaRuler className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-800">
                        Referência capturada com sucesso!
                      </p>
                      <p className="text-sm text-green-600">
                        Nonce: {embeddingData?.nonce.substring(0, 16)}...
                      </p>
                    </div>
                    <button
                      onClick={handleRedoReference}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Refazer
                    </button>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>📸 Agora:</strong> Capture uma foto simulando a
                      tentativa de reconhecimento no totem. Pode variar
                      levemente a pose ou iluminação para testar a robustez.
                    </p>
                  </div>

                  <FaceCapture
                    mode="single"
                    onCapture={handleTestImageCapture}
                    loading={loading}
                    faceInfo={null}
                    onCancel={handleRedoReference}
                    onSuccess={() => {}}
                  />
                </div>
              )}

              {/* Passo 3: Threshold e resultado */}
              {step === "result" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">Referência</p>
                      <p className="font-mono text-sm text-green-800 break-all">
                        Nonce: {embeddingData?.nonce.substring(0, 20)}...
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">
                        Imagem de teste
                      </p>
                      <p className="text-sm text-blue-800">Foto capturada ✓</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleRedoReference}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Refazer referência
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={handleRedoTest}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Refazer teste
                    </button>
                  </div>

                  {/* Threshold Slider */}
                  <ThresholdSlider value={threshold} onChange={setThreshold} />

                  {/* Botão executar teste */}
                  <button
                    onClick={handleRunTest}
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 text-lg"
                  >
                    {loading
                      ? "Processando..."
                      : "Executar Teste com este Threshold"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Resultados */}
          {calibrationError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700">{calibrationError}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <CalibrationResultCard result={result} />

              <div className="flex justify-center">
                <button
                  onClick={handleNewTest}
                  className="px-8 py-3 border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <FaArrowLeft />
                  Novo Teste Completo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
