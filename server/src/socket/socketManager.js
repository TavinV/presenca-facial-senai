import JwtService from "../services/JwtService.js";

let ioInstance = null;

/**
 * Inicializa o Socket.IO
 */
export const initSocket = (io) => {
    ioInstance = io;
    console.log("🔌 Socket.IO inicializado.");
    /**
     * 🔐 Middleware de autenticação no handshake
     */
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Token não fornecido."));
            }

            const decoded = JwtService.verifyToken(token);

            socket.user = decoded; // anexamos usuário ao socket

            next();
        } catch (error) {
            return next(new Error("Token inválido."));
        }
    });

    /**
     * 🔌 Conexão principal
     */
    io.on("connection", (socket) => {
        console.log(
            `🔌 Conectado: ${socket.user?.email} | SocketID: ${socket.id}`
        );

        /**
         * 📚 Entrar em uma sessão específica
         */
        socket.on("joinSession", (sessionId) => {
            if (!sessionId) {
                console.warn("⚠️ joinSession sem sessionId.");
                return;
            }

            const roomName = getSessionRoomName(sessionId);

            socket.join(roomName);

            console.log(
                `📚 ${socket.user?.email} entrou na sala ${roomName}`
            );
        });

        /**
         * 🚪 Sair de uma sessão
         */
        socket.on("leaveSession", (sessionId) => {
            if (!sessionId) return;

            const roomName = getSessionRoomName(sessionId);

            socket.leave(roomName);

            console.log(
                `🚪 ${socket.user?.email} saiu da sala ${roomName}`
            );
        });

        /**
         * ❌ Desconexão
         */
        socket.on("disconnect", () => {
            console.log(
                `❌ Desconectado: ${socket.user?.email} | SocketID: ${socket.id}`
            );
        });
    });
};

/**
 * Retorna instância do IO
 */
export const getIO = () => {
    if (!ioInstance) {
        throw new Error("Socket.IO não foi inicializado.");
    }

    return ioInstance;
};

/**
 * Gera nome padronizado da room
 */
export const getSessionRoomName = (sessionId) => {
    return `session_${sessionId}`;
};

/**
 * Emite nova presença para sessão específica
 */
export const emitNewAttendance = ({
    sessionId,
    attendanceData
}) => {
    const io = getIO();
    const roomName = getSessionRoomName(sessionId);

    io.to(roomName).emit("newAttendance", attendanceData);
};

/**
 * Emite evento genérico para sessão
 */
export const emitToSession = ({
    sessionId,
    eventName,
    payload
}) => {
    const io = getIO();
    const roomName = getSessionRoomName(sessionId);

    io.to(roomName).emit(eventName, payload);
};

/**
 * Emite evento global (evitar usar muito)
 */
export const emitGlobal = ({
    eventName,
    payload
}) => {
    const io = getIO();
    io.emit(eventName, payload);
};