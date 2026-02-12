import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function PageHeader({ backTo, icon: Icon, title, subtitle }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      {/* Botão voltar */}
      {backTo && (
        <button
          onClick={() => navigate(backTo)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Voltar</span>
        </button>
      )}

      {/* Header principal */}
      <div className="flex items-center space-x-4">
        {/* Ícone */}
        <div className="p-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-md">
          {Icon && <Icon className="text-white text-2xl" />}
        </div>

        {/* Texto */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

PageHeader.propTypes = {
  backTo: PropTypes.string,
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};
