import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { initSocket } from "./src/socket/socketManager.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

initSocket(io);

server.listen(PORT, () => {
    console.log(`
    🚀 Servidor rodando na porta ${PORT}
    `);
});