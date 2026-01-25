import { useState } from "react";
import { FiKey, FiSave, FiX } from "react-icons/fi";

export default function KeyModal({ isOpen, onClose, onSave, currentKey }) {
    const [key, setKey] = useState(currentKey);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Chave do Sistema</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Digite a chave de acesso"
                    className="w-full px-4 py-3 border rounded-lg mb-4"
                />

                <div className="flex space-x-3">
                    <button
                        onClick={() => onSave(key)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2"
                    >
                        <FiSave className="w-5 h-5" />
                        <span>Salvar</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}