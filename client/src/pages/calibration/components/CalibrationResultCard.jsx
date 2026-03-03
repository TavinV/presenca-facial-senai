// pages/calibration/components/CalibrationResultCard.jsx
import { motion } from "framer-motion";
import {
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";

import { FaXmark } from "react-icons/fa6";


export default function CalibrationResultCard({ result }) {
  if (!result) return null;

  const { match_result, confidence, comparison_with_default, recommendations } =
    result;

  const cleanStatus = recommendations.status
  ?.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "")
  .trim();

  // Definir cores baseadas no status
  const statusConfig = {
    "APROVADO": {
      icon: FaCheck,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    "REVISAR": {
      icon: FaExclamationTriangle,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  };

  const config = statusConfig[cleanStatus] || statusConfig["REVISAR"];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header com status */}
      <div className={`p-6 ${config.bg} border-2 ${config.border} rounded-xl`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 ${config.iconBg} rounded-full`}>
            <StatusIcon className={`${config.iconColor} text-2xl`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${config.text}`}>
              {cleanStatus}
            </h3>
            <p className="text-gray-700 mt-1">{recommendations.suggestion}</p>
          </div>
        </div>
      </div>

      {/* Resultado do match */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800">
            Resultado da Comparação
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Distância</p>
              <p className="text-3xl font-bold text-gray-900">
                {match_result.distance.toFixed(4)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Margem</p>
              <p className="text-3xl font-bold text-gray-900">
                {match_result.margin.toFixed(4)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Margem %</p>
              <p className="text-2xl font-bold text-blue-600">
                {match_result.margin_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Threshold testado</p>
              <p className="text-2xl font-bold text-red-600">
                {match_result.tested_threshold.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`text-2xl ${match_result.would_match ? "text-green-600" : "text-red-600"}`}
              >
                {match_result.would_match ? <FaCheck className="text-green-600" /> : <FaXmark className="text-red-600" />}
              </div>
              <div>
                <p className="font-medium">
                  {match_result.would_match
                    ? "O rosto seria RECONHECIDO com este threshold"
                    : "O rosto NÃO seria reconhecido com este threshold"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confiança */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800">Nível de Confiança</h4>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-2 rounded-full font-medium ${
                confidence.level === "high"
                  ? "bg-green-100 text-green-800"
                  : confidence.level === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {confidence.level === "high"
                ? "ALTA"
                : confidence.level === "medium"
                  ? "MÉDIA"
                  : "BAIXA"}
            </div>
            <p className="text-gray-700">{confidence.description}</p>
          </div>
        </div>
      </div>

      {/* Comparação com threshold default */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800">
            Comparação com Threshold Padrão
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Threshold Padrão</p>
              <p className="text-2xl font-bold text-gray-900">
                {comparison_with_default.default_threshold.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Diferença</p>
              <p
                className={`text-2xl font-bold ${
                  comparison_with_default.difference_from_default === 0
                    ? "text-gray-900"
                    : comparison_with_default.difference_from_default > 0
                      ? "text-blue-600"
                      : "text-orange-600"
                }`}
              >
                {comparison_with_default.difference_from_default > 0 ? "+" : ""}
                {comparison_with_default.difference_from_default.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-center">
              {comparison_with_default.would_match_with_default
                ? "Com o threshold padrão, o rosto seria reconhecido"
                : "Com o threshold padrão, o rosto NÃO seria reconhecido"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
