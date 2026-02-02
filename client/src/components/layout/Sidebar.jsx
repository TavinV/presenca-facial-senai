import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../ui/Logo';
import OVLogo from '../ui/OVLogo';
import { ROUTES } from '../../routes';
import {
    FiHome,
    FiUsers,
    FiUser,
    FiCalendar,
    FiClipboard,
    FiMapPin,
    FiMonitor,
    FiFileText,
    FiSettings,
    FiChevronLeft,
    FiChevronRight,
    FiLogOut,
    FiBook,
    FiCamera
} from 'react-icons/fi';

export default function Sidebar({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Links comuns para professores
    const professorLinks = [
        { path: ROUTES.PRIVATE.CLASSES.LIST, label: 'Minhas Turmas', icon: <FiBook className="text-xl" />, require: 'both' },
        { path: ROUTES.PRIVATE.STUDENTS.LIST, label: 'Alunos', icon: <FiUsers className="text-xl" />, require: 'both' },
        { path: ROUTES.PRIVATE.SESSIONS.LIST, label: 'Aulas', icon: <FiCalendar className="text-xl" />, require: 'both' },
    ];

    // Links apenas para coordenadores
    const coordinatorLinks = [
        { path: ROUTES.PRIVATE.TEACHERS.LIST, label: 'Professores', icon: <FiUser className="text-xl" />, require: 'coordinator' },
        { path: ROUTES.PRIVATE.ROOMS.LIST, label: 'Salas', icon: <FiMapPin className="text-xl" />, require: 'coordinator' },
        { path: ROUTES.PRIVATE.TOTEMS.LIST, label: 'Totens', icon: <FiMonitor className="text-xl" />, require: 'coordinator' },
        { path: ROUTES.PRIVATE.PROFILE, label: 'Configurações', icon: <FiSettings className="text-xl" />, require: 'both' },
    ];

    // Combinar links baseado no role
    const getMenuItems = () => {
        if (user?.role === 'coordenador') {
            return [...professorLinks, ...coordinatorLinks];
        }
        return professorLinks.filter(item => item.require === 'both');
    };

    const menuItems = getMenuItems();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const closeMobileSidebar = () => {
        setIsMobileOpen(false);
    };

    const handleLogout = () => {
        logout();
        closeMobileSidebar();
    };

    // Variantes de animação
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const mobileSidebarVariants = {
        hidden: { x: '-100%' },
        visible: {
            x: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300
            }
        },
        exit: {
            x: '-100%',
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300
            }
        }
    };

    const menuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.3
            }
        }),
        exit: { opacity: 0, x: -20 }
    };

    return (
      <>
        {/* Overlay para mobile com animação */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-[#00000037] z-40 sm:hidden"
              onClick={closeMobileSidebar}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Sidebar desktop (inalterada) */}
        <aside
          className={`
                    bg-gradient-to-b from-senai-red via-red-600 to-red-700 text-white h-screen flex-col transition-all duration-300 ease-in-out fixed top-0 left-0
                    hidden z-40 sm:flex ${isCollapsed ? "w-20" : "w-64"}
                `}
        >
          {/* Logo + Toggle */}
          <div className="p-4 border-b border-red-500 flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center justify-center">
                <img src="/senai_type.png" className="w-[50%]" />
              </div>
            ) : (
              <div className="mx-auto flex items-center justify-center">
                <img src="/senai_s.png" className="w-[80%]" />
              </div>
            )}

            {/* Botão toggle desktop */}
            <button
              onClick={toggleSidebar}
              className={`text-white bg-red-700 hover:bg-red-800 p-1 rounded-lg transition-colors absolute ${
                isCollapsed ? "right-[-15px]" : "right-4"
              }`}
            >
              {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={`${item.path}-${index}`}>
                  <NavLink
                    to={item.path}
                    className={`
                                        flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group
                                        ${
                                          isActive(item.path)
                                            ? "bg-white text-red-600 shadow-sm"
                                            : "text-white hover:bg-red-500 hover:text-white"
                                        }
                                        ${isCollapsed ? "justify-center" : ""}
                                    `}
                    title={isCollapsed ? item.label : ""}
                  >
                    <div
                      className={
                        isActive(item.path)
                          ? "text-red-600"
                          : "text-red-200 group-hover:text-white"
                      }
                    >
                      {item.icon}
                    </div>

                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* FOOTER */}
          <div className="p-4 border-t border-red-500 space-y-4">
            {/* Botão de Logout - desktop expandido */}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className={`
                                flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group
                                text-white hover:bg-red-800 hover:text-white w-full
                            `}
              >
                <FiLogOut className="text-xl text-red-200 group-hover:text-white" />
                <span className="font-medium text-sm">Sair</span>
              </button>
            )}

            {/* OV Logo - desktop */}
            <div className={`flex justify-start gap-6 items-center ${isCollapsed ? "px-2" : ""}`}>
              <OVLogo className={`${isCollapsed ? "w-8 h-8" : "w-10 h-10"}`} />
              {!isCollapsed && (
                <p className="text-xs text-red-300 text-center mt-2">
                  por Otávio Vinicius
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Sidebar mobile com animação */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.aside
              key="mobile-sidebar"
              className="fixed inset-y-0 left-0 z-50 flex w-full sm:hidden bg-gradient-to-b from-senai-red via-red-600 to-red-700 text-white flex-col"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileSidebarVariants}
            >
              {/* Logo + Toggle mobile */}
              <div className="p-4 border-b border-red-500 flex items-center justify-between">
                <div className="flex items-center justify-center">
                  <img src="/senai_type.png" className="w-[50%]" />
                </div>

                {/* Botão fechar no mobile */}
                <button
                  onClick={closeMobileSidebar}
                  className="text-white bg-red-700 hover:bg-red-800 px-2 py-1 rounded-lg"
                >
                  <FiChevronLeft />
                </button>
              </div>

              {/* Navigation mobile */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={`${item.path}-mobile-${index}`}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={menuItemVariants}
                    >
                      <NavLink
                        to={item.path}
                        onClick={closeMobileSidebar}
                        className={`
                                                flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group
                                                ${
                                                  isActive(item.path)
                                                    ? "bg-white text-red-600 shadow-sm"
                                                    : "text-white hover:bg-red-500 hover:text-white"
                                                }
                                            `}
                      >
                        <div
                          className={
                            isActive(item.path)
                              ? "text-red-600"
                              : "text-red-200 group-hover:text-white"
                          }
                        >
                          {item.icon}
                        </div>
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* FOOTER mobile */}
              <div className="p-4 border-t border-red-500 space-y-4">
                {/* Botão de Logout - mobile */}
                <motion.button
                  custom={menuItems.length}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  onClick={handleLogout}
                  className={`
                                    flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group
                                    text-white hover:bg-red-800 hover:text-white w-full
                                `}
                >
                  <FiLogOut className="text-xl text-red-200 group-hover:text-white" />
                  <span className="font-medium text-sm">Sair</span>
                </motion.button>

                {/* OV Logo - mobile */}
                <motion.div
                  custom={menuItems.length + 2}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  className="flex flex-col items-center"
                >
                  <OVLogo className="w-10 h-10" />
                  <p className="text-xs text-red-300 mt-2">
                    Desenvolvido por Otávio Vinicius & Lucas Gomes
                  </p>
                </motion.div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
}