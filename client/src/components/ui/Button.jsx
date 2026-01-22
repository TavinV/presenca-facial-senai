export default function Button({
    children,
    type = 'button',
    variant = 'primary',
    disabled = false,
    loading = false,
    className = '',
    ...props
}) {
    const baseStyles = 'px-4 py-2 rounded-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-senai-red text-white hover:bg-red-700 focus:ring-red-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="ml-2">Carregando...</span>
                </div>
            ) : children}
        </button>
    );
}