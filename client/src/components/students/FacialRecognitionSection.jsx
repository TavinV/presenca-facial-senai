import { useState, useEffect } from 'react';
import FaceCapture from './FaceCapture'; // Importação do componente FaceCapture
import {
  FaCamera,
  FaInfoCircle,
  FaCheckCircle,
  FaUserCircle,
  FaSync,
  FaTrash,
  FaExclamationTriangle,
  FaTimesCircle
} from 'react-icons/fa';

export default function FacialRecognitionSection({
  faceInfo,
  onCapture,
  onRemove,
  processing = false
}) {
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);

  const handleFaceCapture = (imageData) => {
    onCapture(imageData);
    setLocalProcessing(true);
  };

  const handleRemove = () => {
      onRemove();
  };

  const handleCancelCapture = () => {
    setShowFaceCapture(false);
  };

  // Determinar se há reconhecimento facial configurado
  const hasFacialRecognition = faceInfo?.status === "processed" || localProcessing;

  useEffect(() => {
    if (faceInfo?.status === "processed" || faceInfo?.status === "error") {
      setLocalProcessing(false);
      setShowFaceCapture(false);
    }
  }, [faceInfo]);

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="p-3 bg-red-100 rounded-lg flex-shrink-0">
          <FaCamera className="text-red-600 text-lg" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Reconhecimento Facial
          </h3>
          <p className="text-sm text-gray-600">
            Configuração opcional para presenças automáticas via câmera
          </p>
        </div>
      </div>

      {/* Informação sobre facial opcional */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              <span className="font-medium">O reconhecimento facial é opcional.</span> O aluno pode ser
              cadastrado sem ele e depois ter presenças registradas manualmente.
            </p>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      {showFaceCapture ? (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">

          {/* Componente FaceCapture */}
          <div className='w-full flex items-center justify-center'>
              <FaceCapture
                loading={processing}
                onCapture={handleFaceCapture}
                faceInfo={faceInfo}
                onCancel={handleCancelCapture}
                onSuccess={() => {setShowFaceCapture(false)}}
                />
            </div>
        </div>
      ) : (
        <div className={`p-6 rounded-xl border-2 transition-all ${hasFacialRecognition
            ? 'border-green-200 bg-green-50'
            : faceInfo?.status === "error"
              ? 'border-red-200 bg-red-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Status */}
            <div className="flex items-center space-x-4 flex-1">
              <div className={`p-4 rounded-full ${hasFacialRecognition
                  ? 'bg-green-100 text-green-600'
                  : faceInfo?.status === "error"
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                {hasFacialRecognition ? (
                  <FaCheckCircle className="text-xl" />
                ) : faceInfo?.status === "error" ? (
                  <FaTimesCircle className="text-xl" />
                ) : (
                  <FaUserCircle className="text-xl" />
                )}
              </div>
              <div className="flex-1">
                {hasFacialRecognition ? (
                  <>
                    <h4 className="font-semibold text-lg text-green-800">
                      Reconhecimento Facial Configurado
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      O aluno pode ser reconhecido automaticamente via câmera
                    </p>
                  </>
                ) : faceInfo?.status === "error" ? (
                  <>
                    <h4 className="font-semibold text-lg text-red-800">
                      Erro no Processamento
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {faceInfo.message || 'Ocorreu um erro ao processar a imagem facial'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Tente capturar novamente ou continue sem reconhecimento facial
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="font-semibold text-lg text-gray-800">
                      Sem Reconhecimento Facial
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      O aluno será registrado apenas manualmente
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2">
              {hasFacialRecognition ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFaceCapture(true)
                      onRemove();
                    }}
                    className="px-4 py-2 text-green-700 hover:text-green-900 font-medium rounded-lg border border-green-300 hover:border-green-400 bg-white hover:bg-green-50 transition-colors flex items-center space-x-2"
                  >
                    <FaSync />
                    <span>Recapturar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-4 py-2 text-red-600 hover:text-red-800 font-medium rounded-lg border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <FaTrash />
                    <span>Remover</span>
                  </button>
                </>
              ) : faceInfo?.status === "error" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowFaceCapture(true)}
                    className="px-4 py-2 text-red-600 hover:text-red-800 font-medium rounded-lg border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <FaSync />
                    <span>Tentar Novamente</span>
                  </button>
                  <button
                    type="button"
                    onClick={onRemove}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Continuar sem Facial
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFaceCapture(true)}
                  className="px-6 py-3 rounded-lg font-medium transition-all bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg flex items-center space-x-2"
                >
                  <FaCamera />
                  <span>Capturar Rosto</span>
                </button>
              )}
            </div>
          </div>

          {/* Instruções quando não há facial ou erro */}
          {(!hasFacialRecognition && faceInfo?.status !== "error") && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">
                    Sem reconhecimento facial configurado. O aluno ainda poderá ter presenças
                    registradas manualmente pelos professores.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de erro detalhada */}
          {faceInfo?.status === "error" && faceInfo.message && (
            <div className="mt-6 pt-6 border-t border-red-200">
              <div className="flex items-start space-x-3">
                <FaTimesCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Detalhes do erro:</p>
                  <p className="text-sm text-red-600 mt-1">{faceInfo.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}