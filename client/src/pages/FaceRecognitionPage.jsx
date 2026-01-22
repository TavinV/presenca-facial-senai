import { useState, useEffect, useRef } from "react";
import { FiCamera, FiKey, FiSave, FiX, FiPower, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { Logo } from "../components/ui/Logo";
import OVLogo from "../components/ui/OVLogo";
import useAttendances from "../hooks/useAttendances";

export default function FacialAttendancePage() {
  const { createFacial } = useAttendances();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [savedKey, setSavedKey] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Carregar chave salva ao iniciar
  useEffect(() => {
    const storedKey = localStorage.getItem("totemApiKey");
    if (storedKey) {
      setSavedKey(storedKey);
    }
  }, []);

  // Inicializar câmera
  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Erro na câmera:", err);
        setCameraError("Câmera não acessível");
        setIsCameraActive(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  function showToast(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  }

  async function handleCapture() {
    try {
      if (!isCameraActive || !videoRef.current) {
        showToast('error', 'Câmera não disponível');
        return;
      }

      if (!savedKey) {
        setShowKeyInput(true);
        showToast('error', 'Configure a chave primeiro');
        return;
      }

      setLoading(true);

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
      });

      if (!blob) {
        throw new Error('Erro ao criar blob da imagem');
      } 

        const file = new File([blob], "face.png", { type: "image/png" });

        try {
          const result = await createFacial(file, savedKey);
          
          if (!result.success) {
            throw new Error(result.message || "Falha no reconhecimento");
          }

          showToast('success', 'Presença registrada para ' + (result.data.student?.name || 'Aluno desconhecido'));
        } catch (err) {
          console.error(err);
          showToast('error', err.message || 'Erro no reconhecimento');
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        showToast('error', 'Erro na captura');
        setLoading(false);
      }
  }

  function handleSaveKey(key) {
    localStorage.setItem("totemApiKey", key);
    setSavedKey(key);
    setShowKeyInput(false);
    showToast('success', 'Chave salva');
  }

  function handleClearKey() {
    localStorage.removeItem("totemApiKey");
    setSavedKey("");
    showToast('info', 'Chave removida');
  }

  function toggleCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach(track => {
        track.enabled = !track.enabled;
      });

      setIsCameraActive(tracks[0]?.enabled || false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header Minimalista sem fundo */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4">
        <div className="flex justify-center items-center">
          {/* Logo Presença Facial */}
          <div className="flex items-center">
            <Logo framed={false} size="sm" />
          </div>

          {/* Logo Pessoal e Botão Config */}
          <div className="flex items-center space-x-3">
            {!savedKey && (
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-700/50 transition-colors"
                title="Configurar chave"
              >
                <FiKey className="w-5 h-5 text-gray-300" />
              </button>
            )}
            
          </div>
        </div>
      </header>

      {/* Toast Messages */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm border animate-fade-in ${message.type === 'success' ? 'bg-green-900/90 border-green-700 text-green-100' : 'bg-red-900/90 border-red-700 text-red-100'}`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ?
              <FiCheckCircle className="w-5 h-5" /> :
              <FiAlertCircle className="w-5 h-5" />
            }
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Modal de Configuração */}
      {showKeyInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowKeyInput(false)} />

          <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Chave do Totem</h3>
              <button
                onClick={() => setShowKeyInput(false)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={savedKey}
                onChange={(e) => setSavedKey(e.target.value)}
                placeholder="Digite a chave de API do totem"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                autoFocus
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => handleSaveKey(savedKey)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                >
                  <FiSave className="w-5 h-5" />
                  <span>Salvar</span>
                </button>

                {savedKey && (
                  <button
                    onClick={handleClearKey}
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-xl transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="pt-20 px-4 md:px-6 pb-8 min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full">
          {/* Preview da Câmera */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {cameraError ? (
              <div className="aspect-video flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <FiAlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-gray-300 font-medium">{cameraError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video object-cover"
                />

                {/* Overlay de Assinatura */}
                <div className="absolute bottom-4 right-4 px-3 py-2 rounded-lg flex items-center space-x-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <OVLogo color="black" />
                    </div>
                </div>

                {/* Indicador de Status */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-white text-sm">
                    {isCameraActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-white font-medium">Processando...</p>
                  </div>
                )}
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controles */}
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={handleCapture}
              disabled={!isCameraActive || loading || !savedKey}
              className={`capture-btn flex items-center justify-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform active:scale-95 ${!isCameraActive || loading || !savedKey ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:scale-105 text-white shadow-lg'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <FiCamera className="w-6 h-6" />
                  <span>Registrar Presença</span>
                </>
              )}
            </button>

            {/* Status da Chave */}
            <div className="mt-6 flex items-center space-x-2">
              {
                !savedKey && (
                  <FiKey className={`w-4 h-4 ${savedKey ? 'text-green-500' : 'text-yellow-500'}`} />
                )
              }
              <span className={`text-sm ${savedKey ? 'text-green-400' : 'text-yellow-400'}`}>
                {savedKey ? '' : 'Chave não configurada'}
              </span>
            </div>

            {/* Instrução simples */}
            <p className="mt-4 text-gray-400 text-center max-w-md">
              Posicione-se frente à câmera e clique para registrar
            </p>
          </div>
        </div>
      </main>

      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}