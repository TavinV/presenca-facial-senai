import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiBell, FiChevronDown, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { Logo } from '../ui/Logo';
import OVLogo from '../ui/OVLogo';

export default function Header({ onMobileMenuClick }) {
    const { user, logout } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Se não estiver logado - Header público
    if (!user) {
        return (
            <header className={`md:w-[50%] w-full`} >
                <div className="flex justify-between items-center h-16">
                    {/* Logo Facial à esquerda */}
                    <div className="flex items-center w-full justify-between">
                        <Logo framed={false} />
                        <OVLogo className='md:hidden' color='black'/>
                    </div>
                </div>
            </header>
        );
    }

    // Se estiver logado - Header privado
    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex justify-between items-center px-4 md:px-6 py-4">
                {/* Botão menu mobile */}
                <div className='absolute left-4 p-0 sm:hidden flex items-center'>
                    <button
                        className='sm:hidden flex p-2 rounded-lg hover:bg-gray-100 transition-colors'
                        onClick={onMobileMenuClick}
                    >
                        <FiMenu className='text-2xl text-gray-700' />
                    </button>
                </div>

                {/* Centro - Logo e Título */}
                <div className="flex items-center space-x-3">
                    {/* Logo desktop */}
                    <div className="hidden sm:flex items-center space-x-3">
                        <Logo framed={true} color="red" text={false} />
                        <div>
                            <h1 className="text-lg md:text-xl font-semibold text-gray-800">
                                Presença Facial SENAI
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500">
                                Sistema de Controle de Presença por Reconhecimento Facial
                            </p>
                        </div>
                    </div>
                </div>

                {/* Direita - Info do usuário */}
                <div className="flex items-center space-x-3 md:space-x-4">

                    {/* Avatar do usuário com dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-senai-red to-red-500 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-700">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.role === 'coordenador' ? 'Coordenador' : 'Professor'}
                                </p>
                            </div>
                            <FiChevronDown className={`text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown menu */}
                        {userMenuOpen && (
                            <div className="absolute right-0 top-full mt-7 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                

                                <div className="p-2">
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-red-50 transition-colors text-left text-red-600"
                                        >
                                            <FiLogOut className="text-red-600" />
                                            <span className="font-medium">Sair</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}