import { useEffect, useRef, useState } from "react";
import { FaCamera, FaRedo } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import OVLogo from "../ui/OVLogo";

export default function FaceCapture({
  onCapture,
  loading,
  faceInfo,
  onCancel,
  onSuccess,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraLoaded, setCameraLoaded] = useState(false);

  const [capturedImages, setCapturedImages] = useState([]); // Array para as 3 imagens
  const [captureStep, setCaptureStep] = useState(0); // 0, 1, 2 para as 3 imagens
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState(null); // 'center', 'left', 'right'

  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [dots, setDots] = useState(1);
  const [loops, setLoops] = useState(0);
  const loadingPhrases = [
    "Criando um registro facial seguro",
    "Processando sua biometria com precisão",
    "Analisando características do rosto",
    "Garantindo a qualidade do registro facial",
    "Aplicando camadas de segurança ao reconhecimento",
    "Validando a consistência da imagem capturada",
    "Preparando seu identificador facial",
    "Conferindo detalhes para maior precisão",
    "Protegendo seus dados durante o processo",
    "Finalizando o registro biométrico",
    "Seu rosto está sendo registrado com segurança",
    "Processo quase concluído, só um instante",
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
    if (loading) return;

    let type = "center";
    if (captureStep === 1) type = "right";
    if (captureStep === 2) type = "left";

    setOverlayType(type);
    setShowOverlay(true);

    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [captureStep, loading]);


  useEffect(() => {
    if (loading) return;

    let type = "center";
    if (captureStep === 1) type = "right";
    if (captureStep === 2) type = "left";

    setOverlayType(type);
    setShowOverlay(true);

    // some após 3s (exibição inicial)
    let hideTimeout = setTimeout(() => {
      setShowOverlay(false);
    }, 3000);

    // loop a cada 6s
    const interval = setInterval(() => {
      setShowOverlay(true);

      hideTimeout = setTimeout(() => {
        setShowOverlay(false);
      }, 3000);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimeout);
    };
  }, [captureStep, loading]);


  useEffect(() => {
    let currentStream = null;
    setCameraLoaded(false); // Resetar estado ao iniciar

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Tentar forçar o play
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play().catch((e) => {
                console.log("Auto-play prevention:", e);
              });
            }
          }, 100);
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
        setCameraLoaded(true); // Para mostrar a mensagem de erro
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
      setCameraLoaded(false);
    };
  }, []);
  // Modifique a função takePhoto para capturar múltiplas imagens
  const takePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return setError("Erro ao capturar imagem");

      // Adiciona a imagem capturada ao array
      const newImages = [...capturedImages, blob];
      setCapturedImages(newImages);

      // Avança para o próximo passo
      if (captureStep < 2) {
        setCaptureStep(captureStep + 1);

        // Mostra overlay para próxima direção
        const nextOverlay = captureStep === 0 ? "right" : "left";
        setOverlayType(nextOverlay);
        setShowOverlay(true);
        setTimeout(() => setShowOverlay(false), 3000);
      } else {
        // Todas as 3 imagens foram capturadas
        onCapture(newImages); // Envia array de 3 imagens
        setCapturedImages([]);
        setCaptureStep(0);
      }
    }, "image/jpeg");
  };

  if (faceInfo && faceInfo.status === "processed") {
    setTimeout(() => {
      onSuccess();
    }, 2000);
  }

  // Adicione isto antes do return, após as outras variáveis/funções
  const overlayConfig = {
    center: {
      gif: "/logo.svg",
      text: "Olhe para o centro da câmera",
    },
    left: {
      gif: "/logo_olhando_esquerda.gif",
      text: "Olhe ligeiramente para a sua esquerda",
    },
    right: {
      gif: "/logo_olhando_direita.gif",
      text: "Olhe ligeiramente para a sua direita",
    },
  };

  const config = overlayConfig[overlayType];

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {/* Indicador de progresso das fotos */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((step) => (
          <div
            key={step}
            className={`w-3 h-3 rounded-full ${
              step === captureStep
                ? "bg-red-600"
                : step < captureStep
                  ? "bg-green-500"
                  : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <p className="text-center text-gray-600">
        {capturedImages.length === 0 && "Posicione-se para a primeira foto"}
        {capturedImages.length === 1 && "Vire levemente para a direita"}
        {capturedImages.length === 2 && "Agora para a esquerda"}
        {capturedImages.length === 3 && "Todas as fotos capturadas!"}
      </p>

      <div className="w-full relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          onLoadedData={() => {
            setCameraLoaded(true);
          }}
          onLoadedStart={() => {
            setCameraLoaded(false);
          }}
          className="rounded-lg w-full aspect-video object-cover bg-black scale-x-[-1]"
        />

        <div
          className={`absolute scale-80 pointer-events-none bottom-0 w-full py-1 rounded-lg flex items-center justify-center space-x-2 z-40`}
        >
          <OVLogo className="w-2 h-auto" />
          <span className="text-white text-sm font-bold">Otávio Vinícius</span>
        </div>

        {/* Overlay de instruções periódicas (aparece a cada 5s por 3s) */}
        <AnimatePresence>
          {cameraLoaded && showOverlay && overlayType && !loading && (
            <motion.div
              key={overlayType + captureStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/75 z-50 pointer-events-none flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-5">
                <img
                  src={overlayConfig[overlayType]?.gif}
                  className="w-32"
                  alt="Instrução de direção"
                />
                <p className="text-white font-medium text-center text-lg max-w-md">
                  {overlayConfig[overlayType]?.text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay (quando está processando) */}
        {loading && (
          <div className="absolute bg-black/55 bottom-0 z-50 right-0 left-0 w-full h-full pointer-events-none flex justify-center items-center">
            <div className="flex-col justify-center items-center flex gap-5">
              <img src="/loading-logo.gif" className="w-20" alt="" />
              <p className="text-white font-medium text-center">
                {loadingPhrases[phraseIndex]}
                {".".repeat(dots)}
              </p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-3 justify-center">
        <button
          type="button"
          onClick={takePhoto}
          disabled={loading || capturedImages.length === 3 || showOverlay}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FaCamera />
          {capturedImages.length === 0 && "Capturar Primeira Foto"}
          {capturedImages.length === 1 && "Capturar Segunda Foto"}
          {capturedImages.length === 2 && "Capturar Terceira Foto"}
          {capturedImages.length === 3 && "Todas Capturadas"}
        </button>

        {capturedImages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setCapturedImages([]);
              setCaptureStep(0);
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <FaRedo /> Refazer
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <FaXmark /> Cancelar
        </button>
      </div>

      {capturedImages.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Fotos capturadas: {capturedImages.length}/3
          {capturedImages.length === 3 && " - Pronto para enviar!"}
        </div>
      )}
    </div>
  );
}
