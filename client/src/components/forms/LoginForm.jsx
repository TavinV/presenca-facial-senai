import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ROUTES } from '../../routes';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate(ROUTES.PRIVATE.DASHBOARD);
        } else {
            setError(result.message || 'Erro ao fazer login');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
            />

            <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
            />

            <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
                disabled={!email || !password}
            >
                Acessar a plataforma
            </Button>
            <div className="w-full flex flex-col items-center">
                <NavLink to={ROUTES.PUBLIC.REQUEST_ACCESS} className="text-red-500 hover:underline mt-2 text-center sm:text-sm text-xs">
                    Ainda não possui uma conta? Solicite o acesso
                </NavLink>
            </div>
        </form>
    );
}