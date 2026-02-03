import { useState } from "react";
import Layout from "../components/layout/Layout";
import AccessRequestForm from "../components/forms/AccessRequestForm";
import useAccessRequests from "../hooks/useAccessRequests";
import { Logo } from "../components/ui/Logo";
import Toast from "../components/ui/Toast";
import {
  FaEnvelope,
  FaCheckCircle,
  FaUserShield,
  FaClipboardCheck,
  FaArrowLeft,
  FaPaperPlane,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AccessRequestPage() {
  const { create } = useAccessRequests();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const showToast = (text, type = "info") => {
    setMessage({ text, type });
  };

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const res = await create(payload);
      
      if (res?.success) {
        const requestId = res.data._id || res.data.id;
        setSuccess(requestId);
        showToast("Solicitação enviada com sucesso! Em breve você receberá um retorno.", "success");
      } else {
        showToast(res?.message || "Erro ao enviar solicitação", "error");
      }
      return res;
    } catch (error) {
      showToast("Erro ao processar solicitação", "error");
      return { success: false, message: "Erro ao processar solicitação" };
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNewRequest = () => {
    setSuccess(null);
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <header className="w-full p-4 md:p-2 flex justify-center items-center mb-8 shadow-sm">
          <Logo framed={true} color="red" text={false} />
          <h2 className="ml-4 text-xl font-bold text-gray-800">Presença Facial SENAI</h2>
        </header>
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Voltar
            </button>
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <FaUserShield className="text-red-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Solicitar Acesso ao Sistema
                </h1>
                <p className="text-gray-600 mt-2">
                  Preencha o formulário abaixo para solicitar acesso ao sistema de presença
                </p>
              </div>
            </div>
          </div>

          {/* Estado de Sucesso */}
          {success ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Cabeçalho do Sucesso */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2.5 rounded-lg mr-4">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Solicitação Enviada com Sucesso!
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      Sua solicitação foi recebida e será processada em breve
                    </p>
                  </div>
                </div>
              </div>

              {/* Corpo do Sucesso */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <FaCheckCircle className="text-green-600 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Solicitação Registrada
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Sua solicitação de acesso foi enviada com sucesso e está em análise.
                    Em breve você receberá um e-mail com as instruções de acesso.
                  </p>
                </div>

                {/* Informações da Solicitação */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                    <FaClipboardCheck className="text-green-600 mr-2" />
                    Detalhes da Solicitação
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="bg-white p-3 rounded-lg mr-4">
                        <FaUserShield className="text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 block">ID da Solicitação</span>
                        <span className="font-bold text-gray-800 text-lg">{success}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-white p-3 rounded-lg mr-4">
                        <FaEnvelope className="text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 block">Status</span>
                        <span className="font-bold text-gray-800 text-lg">Em Análise</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instruções de Acompanhamento */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                  <h4 className="font-bold text-gray-800 mb-4">O que acontece agora?</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-3 mt-1">
                        1
                      </div>
                      <span className="text-gray-600">
                        Nossa equipe irá analisar sua solicitação em até 48 horas úteis
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-3 mt-1">
                        2
                      </div>
                      <span className="text-gray-600">
                        Você receberá um e-mail com as credenciais de acesso quando aprovado
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-3 mt-1">
                        3
                      </div>
                      <span className="text-gray-600">
                        Em caso de dúvidas, entre em contato com o administrador do sistema
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleNewRequest}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <FaPaperPlane className="mr-2" />
                    Nova Solicitação
                  </button>
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Voltar ao Início
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Formulário de Solicitação */
            <>
              {/* Instruções */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 mb-8">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <FaClipboardCheck className="text-blue-600 mr-2" />
                  Informações Importantes
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Todos os campos são obrigatórios para análise da solicitação
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    O e-mail informado será utilizado para envio das credenciais
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    O prazo de resposta é de até 48 horas úteis
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Certifique-se de fornecer informações verdadeiras e atualizadas
                  </li>
                </ul>
              </div>

              <AccessRequestForm
                onSubmit={handleSubmit}
                loading={loading}
              />

                {/* Observações */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-medium">
                      Ao enviar esta solicitação, você concorda com os termos de uso do sistema.
                    </span>
                  </p>
                </div>
            </>
          )}

          {/* Informações de Contato */}
          {!success && (
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                <FaEnvelope className="text-gray-600 mr-2" />
                Precisa de ajuda?
              </h4>
              <p className="text-gray-600 mb-2">
                Em caso de dúvidas ou problemas com o formulário, entre em contato:
              </p>
              <div className="flex items-center text-gray-700">
                <FaEnvelope className="mr-2 text-gray-500" />
                <span>suporte@sistema-presenca.edu.br</span>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        <Toast
          message={message.text}
          type={message.type}
          onClose={() => setMessage({ text: "", type: "" })}
        />
      </div>
  );
}