import { useState } from "react";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

export default function Search({
  placeholder = "Buscar...",
  filters = [],
  onChange,
}) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearch(value);
    onChange({ search: value, filters: activeFilters });
  }

  function handleFilterChange(key, value) {
    const updated = { ...activeFilters, [key]: value };
    setActiveFilters(updated);
    onChange({ search, filters: updated });
  }

  function clearFilter(key) {
    const updated = { ...activeFilters };
    delete updated[key];
    setActiveFilters(updated);
    onChange({ search, filters: updated });
  }

  function clearAllFilters() {
    setActiveFilters({});
    onChange({ search, filters: {} });
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="mb-6">
      {/* Barra de Busca Principal */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm"
          />
        </div>

        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <FaFilter className="mr-2 text-gray-600" />
            <span className="font-medium text-gray-700">Filtros</span>
            {hasActiveFilters && (
              <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>
        )}

        {(search || hasActiveFilters) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActiveFilters({});
              onChange({ search: "", filters: {} });
            }}
            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm text-gray-700"
          >
            <FaTimes className="mr-2" />
            Limpar
          </button>
        )}
      </div>

      {/* Filtros Ativos */}
      {hasActiveFilters && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Filtros ativos:
            </span>
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = filters.find((f) => f.key === key);
              const option = filter?.options.find((opt) => opt.value === value);
              return (
                <span
                  key={key}
                  className="inline-flex items-center bg-white border border-red-200 text-red-700 px-3 py-1 rounded-full text-sm"
                >
                  <span className="font-medium mr-1">{filter?.label}:</span>
                  {option?.label || value}
                  <button
                    type="button"
                    onClick={() => clearFilter(key)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <FaTimes size={12} />
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Limpar todos
            </button>
          </div>
        </div>
      )}

      {/* Filtros Dropdown */}
      {showFilters && filters.length > 0 && (
        <div className="mb-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <div className="relative">
                  <select
                    value={activeFilters[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 bg-white appearance-none"
                  >
                    <option value="">Todos</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados da Busca */}
      {(search || hasActiveFilters) && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Buscando por: {search && `"${search}"`}
            {search && hasActiveFilters && " com "}
            {hasActiveFilters &&
              `${Object.keys(activeFilters).length} filtro(s) aplicado(s)`}
          </p>
        </div>
      )}
    </div>
  );
}
