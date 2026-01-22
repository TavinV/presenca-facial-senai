import { useEffect, useRef, useState } from "react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error(err);
        setCameraError(
          "Não foi possível acessar a câmera. Verifique as permissões e se há uma câmera conectada."
        );
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

  function takePhoto() {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ajustar dimensões
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "face.png", { type: "image/png" });
      onCapture({ file });
    }, "image/png");
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
      {cameraError ? (
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">📷</div>
          <p className="text-red-600 font-medium">{cameraError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-senai-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <>
          {/* Video Preview */}
          <div className="relative rounded-xl overflow-hidden bg-gray-900">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto max-h-[60vh] object-contain"
            />

            {/* Overlay de guia */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-white border-opacity-50 rounded-full"></div>
            </div>

            {/* Indicador de status */}
            <div className="absolute top-4 left-4 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isCameraActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="text-white text-sm font-medium">
                {isCameraActive ? 'Câmera ativa' : 'Câmera iniciando...'}
              </span>
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Botão de captura */}
          <div className="mt-6 text-center">
            <button
              onClick={takePhoto}
              disabled={!isCameraActive}
              className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 active:scale-95 ${isCameraActive ? 'bg-senai-red hover:bg-red-700 text-white shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {isCameraActive ? (
                <div className="flex items-center justify-center space-x-3">
                  <span>👤</span>
                  <span>Reconhecer Presença</span>
                </div>
              ) : (
                "Aguardando câmera..."
              )}
            </button>

            <p className="mt-4 text-gray-500 text-sm">
              Clique no botão acima para registrar sua presença
            </p>
          </div>

          {/* Dicas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-500 text-xl">💡</span>
              <div>
                <p className="font-medium text-blue-800">Boa iluminação</p>
                <p className="text-sm text-blue-600">Certifique-se de estar bem iluminado</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
              <span className="text-green-500 text-xl">👁️</span>
              <div>
                <p className="font-medium text-green-800">Olhe para a câmera</p>
                <p className="text-sm text-green-600">Mantenha contato visual com a câmera</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}