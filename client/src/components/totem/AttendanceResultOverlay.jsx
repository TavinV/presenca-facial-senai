import { motion, AnimatePresence } from "framer-motion";

export default function AttendanceResultOverlay({ attendanceResult, onClose }) {
  return (
    <AnimatePresence onExitComplete={onClose}>
      {attendanceResult && (
        <motion.div
          key="attendance-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`absolute inset-0 z-50 flex items-center justify-center ${
            attendanceResult.type === "success"
              ? "bg-gradient-to-br from-green-600/95 to-emerald-700/95"
              : "bg-gradient-to-br from-red-600/95 to-rose-700/95"
          }`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 0.8,
              opacity: 0,
              transition: { duration: 0.3 },
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.1,
            }}
            className="w-full h-full flex flex-col items-center justify-center p-8"
          >
            {/* Ícone principal */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{
                scale: 0,
                rotate: 180,
                transition: { duration: 0.4 },
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                delay: 0.2,
              }}
              className="mb-8"
            >
              <div className={`p-8 rounded-full bg-white/20 backdrop-blur-sm`}>
                {attendanceResult.type === "success" ? (
                  <svg
                    className="w-24 h-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0 }}
                      transition={{
                        delay: 0.3,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                      className="stroke-white"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-24 h-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0 }}
                      transition={{
                        delay: 0.3,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                      className="stroke-white"
                    />
                  </svg>
                )}
              </div>
            </motion.div>

            {/* Mensagem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -20,
                transition: { duration: 0.3 },
              }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-4 max-w-2xl"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {attendanceResult.type === "success"
                  ? "Presença Confirmada"
                  : "Erro."}
              </h3>

              <p className="text-xl md:text-2xl text-white/90 font-medium">
                {attendanceResult.message}
              </p>
            </motion.div>

            {/* Barra de progresso */}
            <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 max-w-md">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 3,
                    ease: "linear",
                  }}
                  className={`h-full ${
                    attendanceResult.type === "success"
                      ? "bg-gradient-to-r from-green-200 to-emerald-300"
                      : "bg-gradient-to-r from-red-200 to-rose-300"
                  }`}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
