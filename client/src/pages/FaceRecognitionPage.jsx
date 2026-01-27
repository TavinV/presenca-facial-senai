import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCamera, FiKey } from "react-icons/fi";
import { Logo } from "../components/ui/Logo";
import CameraSection from "../components/ui/CameraSection";
import KeyManagerModal from "../components/forms/KeyManagerModal";
import Toast from "../components/ui/Toast";
import useAttendances from "../hooks/useAttendances";

export default function FacialAttendancePage() {
  const { createFacial } = useAttendances();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showCamera, setShowCamera] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [savedKey, setSavedKey] = useState("");
  const [isLogoAtTop, setIsLogoAtTop] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;

      if (next === 5) {
        setShowKeyModal(true);
        return 0; // reseta depois de abrir
      }

      return next;
    });
  };

  useEffect(() => {
    if (clickCount === 0) return;

    const timer = setTimeout(() => setClickCount(0), 1500);
    return () => clearTimeout(timer);
  }, [clickCount]);

  // Carregar chave ao iniciar
  useEffect(() => {
    const key = localStorage.getItem("totemApiKey");
    if (key) setSavedKey(key);
  }, []);

  const showToast = (text, type = "info") => {
    setMessage({ text, type });
  };

  const handleCapture = async (file) => {
    if (!savedKey) {
      showToast("Configure a chave primeiro", "error");
      setShowKeyModal(true);
      return;
    }

    setLoading(true);
    try {
      const result = await createFacial(file, savedKey);
      if (result.success) {
        showToast(`Presença confirmada para ${result.data.student.name}!`, "success");
      } else {
        showToast(result.message || "Falha no reconhecimento", "error");
      }
    } catch (error) {
      console.log("Erro ao processar captura:", error);
      showToast("Erro ao processar", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = (key) => {
    localStorage.setItem("totemApiKey", key);
    setSavedKey(key);
    showToast("Chave salva com sucesso", "success");
  };

  const handleClearKey = () => {
    localStorage.removeItem("totemApiKey");
    setSavedKey("");
    showToast("Chave removida", "info");
  };

  const handleStartCamera = () => {
    if (!savedKey) {
      showToast("Configure a chave primeiro", "error");
      setShowKeyModal(true);
      return;
    }

    // Animar logo para o topo
    setIsLogoAtTop(true);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    setTimeout(() => {
      setIsLogoAtTop(false);
    }, 300);
  };

  // Quando a logo chega ao topo, mostrar câmera
  useEffect(() => {
    if (isLogoAtTop) {
      const timer = setTimeout(() => {
        setShowCamera(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLogoAtTop]);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      {/* Logo com animação */}
      <motion.div
        className="fixed w-full z-30"
        initial={false}
        animate={{
          top: isLogoAtTop ? "2rem" : "50%",
          left: "50%",
          x: "-50%",
          y: isLogoAtTop ? 0 : "-50%",
          scale: isLogoAtTop ? 0.7 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
        style={{
          position: "fixed",
          width: "fit-content"
        }}
      >
        <Logo />
      </motion.div>

      {/* Conteúdo principal */}
      <div className="min-h-screen pt-32 px-4">
        <AnimatePresence>
          {!isLogoAtTop && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-40 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartCamera}
                disabled={loading}
                className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl py-4 px-8 text-lg font-bold shadow-2xl flex items-center space-x-3"
              >
                <FiCamera className="w-6 h-6" />
                <span>{loading ? "Processando..." : "Iniciar Captura"}</span>
              </motion.button>

              {/* Botão de configuração */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSecretClick}
                className="mt-8 mx-auto flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <motion.div
                  animate={savedKey ? { rotate: 360 } : {}}
                  transition={savedKey ? { duration: 0.5 } : {}}
                  className="relative"
                >
                  <FiKey className="w-5 h-5" />
                  {savedKey && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"
                    />
                  )}
                </motion.div>
                <span className="text-sm">
                  {savedKey ? "Chave Configurada" : "Configurar Chave"}
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seção da câmera */}
        <AnimatePresence>
          {showCamera && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <CameraSection
                isActive={showCamera}
                onCapture={handleCapture}
                onClose={handleCloseCamera}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modais e Toasts */}
      <KeyManagerModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        currentKey={savedKey}
        onSaveKey={handleSaveKey}
        onClearKey={handleClearKey}
      />

      <Toast
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
      />
    </div>
  );
}