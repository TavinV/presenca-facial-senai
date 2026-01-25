import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

export default function Toast({ message, type, onClose }) {

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose();
        }, 10000); // 10 segundos

        return () => clearTimeout(timer);
    }, [message, onClose]);

    const icons = {
        success: <FiCheckCircle className="w-5 h-5" />,
        error: <FiAlertCircle className="w-5 h-5" />,
        info: <FiInfo className="w-5 h-5" />
    };

    const styles = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl ${styles[type]}`}
                >
                    <div className="flex items-center space-x-3">
                        {icons[type]}
                        <span className="font-medium">{message}</span>
                        <button
                            onClick={onClose}
                            className="ml-4 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
