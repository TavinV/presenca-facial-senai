import { useState } from "react";
import { FiKey, FiLock, FiUnlock, FiTrash2, FiSave, FiX } from "react-icons/fi";

const day = String(new Date().getDate()).padStart(2, "0");  
const month = String(new Date().getMonth() + 1).padStart(2, "0"); 

const ADMIN_PASSWORD = `admin${day}${month}`;

export default function KeyManagerModal({ isOpen, onClose, currentKey, onSaveKey, onClearKey }) {
    const [step, setStep] = useState("password");
    const [password, setPassword] = useState("");
    const [newKey, setNewKey] = useState(currentKey);
    const [error, setError] = useState("");

    const verifyPassword = () => {
        if (password === ADMIN_PASSWORD) {
            setStep("manager");
            setError("");
        } else {
            setError("Senha incorreta");
        }
    };

    const handleSave = () => {
        if (newKey.trim()) {
            onSaveKey(newKey);
            onClose();
        }
    };

    const handleClear = () => {
        onClearKey();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-pop-up">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <FiKey className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold">Gerenciar Chave</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {step === "password" ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Senha de administrador"
                                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm font-medium">{error}</div>
                            )}

                            <button
                                onClick={verifyPassword}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2"
                            >
                                <FiUnlock className="w-5 h-5" />
                                <span>Acessar Configurações</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm ${currentKey ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {currentKey ? 'Chave Configurada' : 'Sem Chave'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nova Chave API
                                </label>
                                <div className="relative">
                                    <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        placeholder="Cole a nova chave"
                                        className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2"
                                >
                                    <FiSave className="w-5 h-5" />
                                    <span>Salvar</span>
                                </button>
                                <button
                                    onClick={handleClear}
                                    disabled={!currentKey}
                                    className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 ${currentKey ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                    <span>Limpar</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}