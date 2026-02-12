import { Link } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";
import { useState, useEffect } from "react";
import useAccessRequests from "../../hooks/useAccessRequests";
import { ROUTES } from "../../routes";

export default function NotificationBadge() {
  const { requests, getAll } = useAccessRequests();
  const [pendingCount, setPendingCount] = useState(0);

  // Atualiza ao montar o componente
  useEffect(() => {
    async function loadRequests() {
      const res = await getAll();
      if (res.success) {
        const pending = res.data.filter((r) => r.status === "pending");
        setPendingCount(pending.length);
      }
    }
    loadRequests();
  }, [getAll]);

  // Atualiza sempre que requests mudarem
  useEffect(() => {
    const pending = requests.filter((r) => r.status === "pending");
    setPendingCount(pending.length);
  }, [requests]);

  return (
    <Link
      to={ROUTES.PRIVATE.ACCESS_REQUESTS}
      title="Solicitações de Acesso"
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <IoIosNotifications className="text-xl md:text-2xl text-gray-700" />

      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      )}
    </Link>
  );
}
