import { useEffect } from "react";
import socket from "../services/socket";

export function useSessionSocket(sessionId, onReportUpdate) {
  useEffect(() => {
    if (!sessionId) return;

    // conecta
    socket.connect();

    // entra na sala
    socket.emit("join-session", sessionId);

    // escuta atualização
    socket.on("session-report-updated", onReportUpdate);

    return () => {
      socket.off("session-report-updated", onReportUpdate);
      socket.emit("leave-session", sessionId);
      socket.disconnect();
    };
  }, [sessionId, onReportUpdate]);
}
