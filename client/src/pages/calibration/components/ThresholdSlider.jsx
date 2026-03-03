// pages/calibration/components/ThresholdSlider.jsx
import { useState } from "react";

export default function ThresholdSlider({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Determinar cor baseada no valor
  const getTrackColor = () => {
    if (localValue < 0.3) return "bg-red-500";
    if (localValue < 0.5) return "bg-yellow-500";
    if (localValue < 0.7) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          Threshold de Similaridade
        </label>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-red-600">
            {localValue.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">/ 1.0</span>
        </div>
      </div>

      <div className="relative pt-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={localValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              #ef4444 0%, 
              #eab308 ${localValue * 30}%, 
              #22c55e ${localValue * 60}%, 
              #3b82f6 ${localValue * 90}%, 
              #3b82f6 100%)`,
          }}
        />

        {/* Marcadores de referência */}
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
          <span className="text-red-600">Baixo (0.0)</span>
          <span className="text-yellow-600">Médio (0.5)</span>
          <span className="text-green-600">Alto (0.7)</span>
          <span className="text-blue-600">Máx (1.0)</span>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Interpretação:</span>{" "}
          {localValue < 0.3 &&
            "Valor muito baixo - Alto risco de falsos positivos"}
          {localValue >= 0.3 &&
            localValue < 0.5 &&
            "Valor baixo - Pode aceitar rostos diferentes"}
          {localValue >= 0.5 &&
            localValue < 0.7 &&
            "Valor padrão - Equilíbrio entre segurança e usabilidade"}
          {localValue >= 0.7 &&
            localValue < 0.9 &&
            "Valor alto - Maior segurança, pode rejeitar rostos válidos"}
          {localValue >= 0.9 && "Valor muito alto - Risco de falsos negativos"}
        </p>
      </div>
    </div>
  );
}
