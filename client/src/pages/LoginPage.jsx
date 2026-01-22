import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Card from '../components/ui/Card';
import OVLogo from '../components/ui/OVLogo';
import Header from '../components/layout/Header';
import LoginForm from '../components/forms/LoginForm';

import { ROUTES } from '../routes';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(ROUTES.PRIVATE.DASHBOARD);
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-senai-blue"></div>
      </div>
    );
  }

  return (
    <main className='py-12 sm:px-10 px-4'>
      <div className="flex h-screen">
        <div className='flex flex-col w-screen md:w-1/2'>
          <Header />
          <div className="flex-col mt-30 flex items-center justify-center">
            <h2 className='font-bold sm:text-5xl text-3xl'>Bem vindo</h2>
            <h3 className='text-gray-700 text-sm text-center'>Entre com seu e-mail e senha, ou solicite acesso</h3>
            <Card
            className='md:w-[80%] w-full mt-10 p-8'
            >
              <LoginForm />
            </Card>
          </div>
        </div>
        <div
          className="
          md:flex flex-col w-1/2 h-[85%] hidden
          rounded-lg shadow-lg
          items-center 
          bg-[radial-gradient(circle_at_center,#FF0000_0%,#CF1919_100%)]
        "
        > 
          <div className="w-full flex justify-end h-16 p-4">
            <OVLogo />
          </div>

          <img src="facial_illustration.svg" className="w-[80%] mt-20" />
        </div>
      </div>

    </main>
  );
}