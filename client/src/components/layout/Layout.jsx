import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
    const { user } = useAuth();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Se não estiver logado, não mostra sidebar
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header onMobileMenuClick={() => { }} />
                <main className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    // Se estiver logado, mostra layout completo com sidebar
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar
                isMobileOpen={mobileSidebarOpen}
                setIsMobileOpen={setMobileSidebarOpen}
            />

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col">
                <Header onMobileMenuClick={() => setMobileSidebarOpen(true)} />

                <main className="flex-1 py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}