import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMenu, FiChevronDown, FiLogOut } from "react-icons/fi";
import { IoIosNotifications } from "react-icons/io";
import NotificationBadge from "../ui/NotificationBadge.jsx";
import { Logo } from "../ui/Logo";
import OVLogo from "../ui/OVLogo";
import { ROUTES } from "../../routes";

export default function Header({ onMobileMenuClick }) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // 🔹 Links comuns (mantido por padrão arquitetural)
  const professorLinks = [];

  // 🔹 Links apenas para coordenadores
  const coordinatorLinks = [
    {
      path: ROUTES.PRIVATE.ACCESS_REQUESTS,
      label: "Solicitações de Acesso",
      icon: IoIosNotifications,
      require: "coordinator",
    },
  ];

  // 🔹 MESMA lógica do Sidebar
  const getMenuItems = () => {
    if (user?.role === "coordenador") {
      return [...professorLinks, ...coordinatorLinks];
    }
    return professorLinks.filter((item) => item.require === "both");
  };

  const menuItems = getMenuItems();

  // Header público
  if (!user) {
    return (
      <header className="md:w-[50%] w-full">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center w-full justify-between">
            <Logo framed={false} />
            <OVLogo className="md:hidden" color="black" />
          </div>
        </div>
      </header>
    );
  }

  // Header privado
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 md:px-6 py-4">
        {/* Lado Esquerdo - SEMPRE com o logo */}
        <div className="flex items-center gap-2">
          {/* Botão menu mobile - aparece apenas em mobile */}
          <button
            className="sm:hidden flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onMobileMenuClick}
            aria-label="Abrir menu"
          >
            <FiMenu className="text-2xl text-gray-700" />
          </button>

          {/* Logo - sempre visível no desktop, no mobile aparece ao lado do menu */}
          <div className="flex items-center">
            <Logo framed={true} color="red" text={false} />
          </div>

          {/* Título e subtítulo - apenas no desktop */}
          <div className="hidden sm:block ml-3">
            <h1 className="text-lg md:text-xl font-semibold text-gray-800">
              Presença Facial
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Sistema de Controle de Presença por Reconhecimento Facial
            </p>
          </div>
        </div>

        {/* Lado Direito - Ícones e Avatar */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* 🔔 Notificações */}
          {menuItems
            .filter((item) => item.require === "coordinator")
            .map((item) => {
              const Icon = item.icon;
              return (
                <NotificationBadge />
              );
            })}

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-r from-senai-red to-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm md:text-base font-bold">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>

              {/* Nome e cargo - apenas no desktop */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 line-clamp-1">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role === "coordenador" ? "Coordenador" : "Professor"}
                </p>
              </div>

              <FiChevronDown
                className={`hidden md:block text-gray-600 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <>
                {/* Overlay para fechar o dropdown ao clicar fora */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />

                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    {/* Informações do usuário no mobile */}
                    <div className="md:hidden px-3 py-2 border-b border-gray-100 mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user.role === "coordenador"
                          ? "Coordenador"
                          : "Professor"}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>

                    {/* Links do menu para mobile (apenas em mobile) */}
                    <div className="md:hidden border-b border-gray-100 pb-2 mb-2">
                      {menuItems
                        .filter((item) => item.require === "coordinator")
                        .map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Icon className="text-xl text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                    </div>

                    {/* Botão de sair */}
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-red-50 transition-colors text-left text-red-600"
                    >
                      <FiLogOut />
                      <span className="font-medium">Sair</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
