import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { maskCpf } from "../../utils/maskCpf";
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaLock,
  FaUserTie,
  FaUserGraduate,
  FaExclamationTriangle,
  FaPaperPlane,
  FaArrowLeft,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa";

export default function AccessRequestForm({ onSubmit }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("professor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name,
        cpf,
        email,
        password,
        role,
      };

      const res = await onSubmit(payload);

      if (!res?.success) {
        setError(res?.message || "Erro ao enviar solicitação");
      }
    } catch (err) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 ">
      <div className="max-w-4xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Voltar
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Cabeçalho do Formulário */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-8">
            <div className="flex items-center">
              <div className="bg-white/20 p-4 rounded-xl mr-6">
                <FaUserGraduate className="text-white text-3xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Solicitação de Acesso ao Sistema
                </h2>
                <p className="text-red-100 mt-2 text-lg">
                  Preencha todos os campos abaixo para solicitar acesso ao
                  sistema SENAI
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10">
            {error && (
              <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-4 text-red-600 text-xl" />
                  <div>
                    <p className="font-bold text-lg mb-1">
                      Erro ao enviar solicitação
                    </p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Coluna Esquerda */}
              <div className="space-y-8 flex flex-col justify-between">
                {/* Nome */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <label className="block">
                    <div className="flex items-center mb-4">
                      <div className="bg-red-100 p-3 rounded-lg mr-4">
                        <FaUser className="text-red-600" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-lg">
                          Nome Completo
                        </span>
                        <p className="text-gray-500 text-sm mt-1">
                          Seu nome completo como consta no documento
                        </p>
                      </div>
                    </div>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="Digite seu nome completo"
                    />
                  </label>
                </div>

                {/* CPF */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <label className="block">
                    <div className="flex items-center mb-4">
                      <div className="bg-red-100 p-3 rounded-lg mr-4">
                        <FaIdCard className="text-red-600" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-lg">
                          CPF
                        </span>
                        <p className="text-gray-500 text-sm mt-1">
                          Digite apenas números
                        </p>
                      </div>
                    </div>
                    <Input
                      value={cpf}
                      onChange={(e) => setCpf(maskCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                      className="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    />
                  </label>
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="space-y-8 flex flex-col justify-between">
                {/* E-mail */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <label className="block">
                    <div className="flex items-center mb-4">
                      <div className="bg-red-100 p-3 rounded-lg mr-4">
                        <FaEnvelope className="text-red-600" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-lg">
                          E-mail
                        </span>
                        <p className="text-gray-500 text-sm mt-1">
                          Utilize um e-mail válido para contato
                        </p>
                      </div>
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="seu.email@exemplo.com"
                    />
                  </label>
                </div>

                {/* Senha */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                  <label className="block">
                    <div className="flex items-center mb-4">
                      <div className="bg-red-100 p-3 rounded-lg mr-4">
                        <FaLock className="text-red-600" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-lg">
                          Senha
                        </span>
                        <p className="text-gray-500 text-sm mt-1">
                          Mínimo 8 caracteres
                        </p>
                      </div>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-5 py-4 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                      placeholder="Digite uma senha segura"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Tipo de Acesso */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 shadow-sm mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <FaUserTie className="text-red-600 text-xl" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-xl">
                    Tipo de Acesso
                  </span>
                  <p className="text-gray-500 text-sm mt-1">
                    Selecione o tipo de acesso desejado
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    role === "professor"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setRole("professor")}
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`p-3 rounded-lg mr-4 ${
                        role === "professor" ? "bg-red-600" : "bg-gray-200"
                      }`}
                    >
                      <FaUserGraduate
                        className={`${role === "professor" ? "text-white" : "text-gray-500"}`}
                      />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 text-lg">
                        Professor
                      </span>
                      <p className="text-gray-500 text-sm mt-1">
                        Ministrar aulas e registrar presenças
                      </p>
                    </div>
                  </div>
                  {role === "professor" && (
                    <div className="flex items-center text-red-600 font-medium">
                      <FaShieldAlt className="mr-2" />
                      Selecionado
                    </div>
                  )}
                </div>

                <div
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    role === "coordenador"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setRole("coordenador")}
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`p-3 rounded-lg mr-4 ${
                        role === "coordenador" ? "bg-red-600" : "bg-gray-200"
                      }`}
                    >
                      <FaUserTie
                        className={`${role === "coordenador" ? "text-white" : "text-gray-500"}`}
                      />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 text-lg">
                        Coordenador
                      </span>
                      <p className="text-gray-500 text-sm mt-1">
                        Acesso administrativo completo
                      </p>
                    </div>
                  </div>
                  {role === "coordenador" && (
                    <div className="flex items-center text-red-600 font-medium">
                      <FaShieldAlt className="mr-2" />
                      Selecionado
                    </div>
                  )}
                </div>
              </div>

              {/* Campo oculto para formulário */}
              <input type="hidden" name="role" value={role} />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg"
              >
                <FaArrowLeft className="mr-3" />
                Cancelar
              </button>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Enviando solicitação...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-3" />
                    Enviar Solicitação de Acesso
                  </>
                )}
              </Button>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-10 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-2xl">
              <div className="flex items-start">
                <FaInfoCircle className="text-red-600 text-2xl mt-1 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-bold text-lg mb-3">
                    Informações importantes
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <FaShieldAlt className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                      Sua solicitação será analisada pela equipe administrativa
                      do SENAI
                    </li>
                    <li className="flex items-start">
                      <FaEnvelope className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                      Você receberá um e-mail de confirmação quando o acesso for
                      aprovado
                    </li>
                    <li className="flex items-start">
                      <FaExclamationTriangle className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                      Todos os campos são obrigatórios e devem ser preenchidos
                      corretamente
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
