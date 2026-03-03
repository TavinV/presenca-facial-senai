// pages/calibration/components/CalibrationCapture.jsx
import { useState, useRef } from "react";
import { FaCamera, FaUpload, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function CalibrationCapture({
  onImageCapture,
  onImageUpload,
  loading,
}) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Iniciar câmera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      setCameraError(
        "Não foi possível acessar a câmera. Verifique as permissões.",
      );
    }
  };

  // Parar câmera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  // Capturar foto da câmera
  const takePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const imageUrl = URL.createObjectURL(blob);
      setCapturedImage({ blob, url: imageUrl });
      onImageCapture(blob);
      stopCamera();
    }, "image/jpeg");
  };

  // Upload de arquivo
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo e tamanho
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    if (file.size > maxSize) {
      alert("Imagem muito grande. Tamanho máximo: 5MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage({ blob: file, url: imageUrl });
    onImageUpload(file);
  };

  // Limpar imagens
  const clearImages = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
      setCapturedImage(null);
    }
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.url);
      setUploadedImage(null);
    }
    if (showCamera) {
      stopCamera();
    }
    onImageCapture(null);
    onImageUpload(null);
  };

  const hasImage = capturedImage || uploadedImage;

  return (
    <div className="space-y-4">
      {/* Preview da imagem */}
      {(capturedImage || uploadedImage) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg overflow-hidden border-2 border-red-200"
        >
          <img
            src={capturedImage?.url || uploadedImage?.url}
            alt="Preview"
            className="w-full aspect-video object-cover"
          />
          <button
            onClick={clearImages}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
            title="Remover imagem"
          >
            <FaTrash size={14} />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
            {capturedImage ? "Foto capturada" : "Imagem enviada"}
          </div>
        </motion.div>
      )}

      {/* Área de captura da câmera */}
      <AnimatePresence>
        {showCamera && !hasImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-video object-cover scale-x-[-1]"
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <button
                  onClick={takePhoto}
                  disabled={loading}
                  className="mx-auto flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  <FaCamera />
                  Capturar Foto
                </button>
              </div>
            </div>

            <button
              onClick={stopCamera}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Cancelar captura
            </button>

            {cameraError && (
              <p className="text-sm text-red-600">{cameraError}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botões de ação quando não há imagem */}
      {!hasImage && !showCamera && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={startCamera}
            disabled={loading}
            className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors group"
          >
            <div className="p-4 bg-gray-100 rounded-full group-hover:bg-red-100 transition-colors">
              <FaCamera className="text-gray-600 group-hover:text-red-600 text-2xl" />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-red-600">
              Usar Câmera
            </span>
            <span className="text-xs text-gray-500">
              Capture uma foto agora
            </span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors group"
          >
            <div className="p-4 bg-gray-100 rounded-full group-hover:bg-red-100 transition-colors">
              <FaUpload className="text-gray-600 group-hover:text-red-600 text-2xl" />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-red-600">
              Enviar Arquivo
            </span>
            <span className="text-xs text-gray-500">
              JPG, PNG ou WebP até 5MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </button>
        </div>
      )}
    </div>
  );
}
