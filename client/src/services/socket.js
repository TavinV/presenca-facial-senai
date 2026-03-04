import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  auth: (cb) => {
    // Lê o token dinamicamente, só na hora da conexão
    cb({ token: JSON.parse(localStorage.getItem("token")) });
  }
});

export default socket;