import Layout from "../components/layout/Layout";
import Search from "../components/ui/Search";
import { useRooms } from "../hooks/useRooms";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaHashtag,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaDoorOpen,
  FaFilter,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function RoomsPage() {
  const [filteredRooms, setFilteredRooms] = useState([]);
  const { rooms, loading, error, loadRooms, deleteRoom } = useRooms();

  // Carregando as salas físicas
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    setFilteredRooms(rooms);
  }, [rooms]);

  function handleSearch({ search, filters }) {
    let result = rooms;

    if (search) {
      result = result.filter(
        (room) =>
          room.code.toLowerCase().includes(search.toLowerCase()) ||
          room.name.toLowerCase().includes(search.toLowerCase()) ||
          room.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filters?.isActive !== undefined) {
      let isActive = filters.isActive;
      if (typeof isActive === "string") {
        if (isActive === "true") isActive = true;
        else if (isActive === "false") isActive = false;
        else isActive = undefined;
      }
      if (isActive !== undefined)
        result = result.filter((room) => room.isActive === isActive);
    }

    setFilteredRooms(result);
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta sala?\nEsta ação não pode ser desfeita."
      )
    )
      return;
    const res = await deleteRoom(id);
    if (res?.success) {
      // Atualiza a lista local
      setFilteredRooms((prev) => prev.filter((r) => (r._id || r.id) !== id));
    } else {
      alert(res?.message || "Erro ao excluir sala");
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
              <div className="text-gray-600 font-semibold text-lg">
                Carregando salas...
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-6 rounded-xl">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-600 text-xl mr-3" />
              <div>
                <div className="font-bold text-lg mb-1">
                  Erro ao carregar salas
                </div>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaBuilding className="text-red-600 mr-3" />
                Salas do Sistema
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie todas as salas físicas disponíveis para turmas
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                {rooms.length} total
              </span>
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                {rooms.filter((r) => r.isActive).length} ativas
              </span>
            </div>
          </div>

          {/* Barra de Ações */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="w-full sm:w-auto">
                <Search
                  placeholder="Buscar salas..."
                  filters={[
                    {
                      key: "isActive",
                      label: "Status",
                      options: [
                        { value: true, label: "Ativo" },
                        { value: false, label: "Inativo" },
                      ],
                    },
                  ]}
                  onChange={handleSearch}
                />
              </div>
              <Link
                to="/rooms/new"
                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FaPlus className="mr-2" />
                Nova Sala
              </Link>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <FaDoorOpen className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma sala encontrada
            </h3>
            <p className="text-gray-500 mb-6">
              Não há salas cadastradas ou que correspondam à sua busca.
            </p>
            <Link
              to="/rooms/new"
              className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Cadastrar Primeira Sala
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Mostrando{" "}
                <span className="font-bold">{filteredRooms.length}</span>{" "}
                sala(s)
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <FaFilter className="mr-2" />
                Use os filtros para refinar sua busca
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => {
                const roomId = room.id || room._id;
                return (
                  <div
                    key={roomId}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
                  >
                    {/* Cabeçalho do Card */}
                    <div
                      className={`px-6 py-4 ${
                        room.isActive
                          ? "bg-gradient-to-r from-green-600 to-green-700"
                          : "bg-gradient-to-r from-gray-600 to-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {room.name}
                          </h3>
                          <p className="text-green-100 text-sm mt-1">
                            {room.isActive ? "Sala Ativa" : "Sala Inativa"}
                          </p>
                        </div>
                        <div
                          className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${
                            room.isActive ? "bg-green-800" : "bg-gray-800"
                          }`}
                        >
                          <FaDoorOpen />
                        </div>
                      </div>
                    </div>

                    {/* Corpo do Card */}
                    <div className="p-6">
                      {/* Código */}
                      <div className="mb-4">
                        <div className="flex items-center text-gray-700 mb-2">
                          <FaHashtag className="text-gray-400 mr-2" />
                          <span className="font-semibold">Código</span>
                        </div>
                        <p className="text-gray-800 ml-7 font-mono">
                          {room.code}
                        </p>
                      </div>

                      {/* Localização */}
                      <div className="mb-6">
                        <div className="flex items-center text-gray-700 mb-2">
                          <FaMapMarkerAlt className="text-gray-400 mr-2" />
                          <span className="font-semibold">Localização</span>
                        </div>
                        <p className="text-gray-800 ml-7">{room.location}</p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {room.isActive ? (
                            <>
                              <FaCheckCircle className="text-green-600 mr-2" />
                              <span className="font-medium text-green-700">
                                Ativa para uso
                              </span>
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="text-gray-400 mr-2" />
                              <span className="font-medium text-gray-600">
                                Indisponível
                              </span>
                            </>
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            room.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {room.isActive ? "DISPONÍVEL" : "INDISPONÍVEL"}
                        </span>
                      </div>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          ID: {roomId.substring(0, 8)}...
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/rooms/${roomId}/edit`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <FaEdit className="mr-2" />
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(roomId)}
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            <FaTrash className="mr-2" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Cards de Estatísticas */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <FaBuilding className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Salas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {rooms.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl mr-4">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Salas Ativas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {rooms.filter((r) => r.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-xl mr-4">
                <FaDoorOpen className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Em Uso</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.floor(rooms.length * 0.6)}{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
