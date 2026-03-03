// pages/calibration/components/PasswordProtection.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const CALIBRATION_PASSWORD = "presencafacialdev"; // Senha definida

export default function PasswordProtection({ onAuthenticated }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CALIBRATION_PASSWORD) {
      onAuthenticated();
    } else {
      setError("Senha incorreta");
      setPassword("");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
            <FaLock className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Área Restrita</h2>
          <p className="text-gray-600 mt-2">
            Esta ferramenta é apenas para calibração do sistema. Digite a senha
            de acesso para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Senha de Calibração
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                placeholder="Digite a senha"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
          >
            Acessar Ferramenta
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Acesso exclusivo para coordenadores e administradores do sistema
        </p>
      </motion.div>
    </div>
  );
}
