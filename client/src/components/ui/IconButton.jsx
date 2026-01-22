export default function IconButton({
    icon: Icon,
    onClick,
    className = '',
    size = 'md',
    variant = 'primary',
    ...props
}) {
    const sizes = {
        sm: 'p-2',
        md: 'p-3',
        lg: 'p-4',
    };

    const variants = {
        primary: 'bg-senai-blue text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    };

    return (
        <button
            onClick={onClick}
            className={`
        ${sizes[size]} 
        ${variants[variant]}
        rounded-lg transition-colors 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-senai-blue
        ${className}
      `}
            {...props}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
}