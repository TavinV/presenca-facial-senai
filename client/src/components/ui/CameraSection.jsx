import { useEffect, useRef, useState } from "react";
import AttendanceResultOverlay from "../totem/AttendanceResultOverlay";
import { motion } from "framer-motion";
import { FiCamera, FiX } from "react-icons/fi";
import { FaHourglass } from "react-icons/fa6";
import OVLogo from "./OVLogo";

export default function CameraSection({
  isActive,
  onCapture,
  onClose,
  loading,
  attendanceResult,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [dots, setDots] = useState(1);
  const [loops, setLoops] = useState(0);
  const loadingPhrases = [
    "Identificando seu rosto com segurança",
    "Verificando sua presença",
    "Processando reconhecimento facial",
    "Aguarde um momento, estamos quase lá",
    "Confirmando seus dados",
    "Analisando imagem capturada",
    "Validando identidade",
    "Finalizando o reconhecimento",
    "Tudo certo, só mais um instante",
    "Preparando o registro de presença",
    "Conectando ao sistema de presença",
    "Garantindo a precisão do reconhecimento",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots < 3) {
          return prevDots + 1;
        }

        // completou um ciclo ". .. ..."
        setLoops((prevLoops) => {
          if (prevLoops + 1 >= 3) {
            // troca a frase após 3 loops completos
            setPhraseIndex(
              (prevPhrase) => (prevPhrase + 1) % loadingPhrases.length,
            );
            return 0;
          }

          return prevLoops + 1;
        });

        return 1; // volta para um ponto
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let stream = null;
    let countdownInterval = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Iniciar contador
        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              onClose();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        setCameraError("Câmera não disponível");
      }
    }

    if (isActive) {
      setCountdown(60);
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [isActive, onClose]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || cameraError) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "face.png", { type: "image/png" });
      onCapture(file);
    }, "image/png");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header da câmera */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FiCamera className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">
              Posicione-se dentro do círculo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-sm font-medium flex items-center gap-3">
              {" "}
              {
                <>
                  <FaHourglass />
                  {countdown}
                </>
              }
              s
            </span>
          </motion.div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Preview da câmera */}
      <div className="relative bg-gray-900">
        {cameraError ? (
          <div className="aspect-video flex flex-col items-center justify-center p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4"
            >
              <FiX className="w-10 h-10 text-red-500" />
            </motion.div>
            <p className="text-white font-medium text-lg mb-4">{cameraError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
              className="w-full h-100 aspect-video object-cover"
            />

            {/* Overlay de guia */}
            {!loading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-64 h-64 border-2 border-white/30 rounded-full"
                />
              </div>
            )}

            {/* Marca d'água */}
            {loading && (
              <div className="absolute bg-black/55 bottom-0 right-0 left-0 w-full h-full pointer-events-none flex justify-center items-center">
                <div className="flex-col justify-center items-center flex gap-5">
                  <img src="/loading-logo.gif" className="w-20" alt="" />
                  <p className="text-white font-medium text-center">
                    {loadingPhrases[phraseIndex]}
                    {".".repeat(dots)}
                  </p>
                </div>
              </div>
            )}

            {attendanceResult && (
              <AttendanceResultOverlay
                attendanceResult={attendanceResult}
                onClose={() => console.log("Animação concluída")}
              />
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`absolute scale-80 pointer-events-none bottom-0 w-full py-1 rounded-lg flex items-center justify-center space-x-2`}
            >
              <OVLogo className="w-2 h-auto" />
              <span className="text-white text-sm font-bold">
                Otávio Vinícius
              </span>
            </motion.div>
          </>
        )}
      </div>

      {/* Botão de captura */}
      <div className="p-6 bg-gray-50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={takePhoto}
          disabled={cameraError}
          className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg ${cameraError ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-red-700"} text-white flex items-center justify-center space-x-3`}
        >
          <FiCamera className="w-6 h-6" />
          <span>
            {cameraError ? "Câmera Indisponível" : "Registrar Presença"}
          </span>
        </motion.button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}