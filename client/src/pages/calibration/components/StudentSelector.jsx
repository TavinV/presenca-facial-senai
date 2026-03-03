// pages/calibration/components/StudentSelector.jsx
import { useState, useEffect } from "react";
import { FaSearch, FaUser, FaIdCard, FaCheck } from "react-icons/fa";

export default function StudentSelector({
  students,
  onSelect,
  onLoadStudents,
  loading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    onLoadStudents({ limit: 100 }); // Carrega mais alunos para seleção
  }, [onLoadStudents]);

  useEffect(() => {
    if (!students || students.length === 0) {
      setFilteredStudents([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredStudents(students.slice(0, 10)); // Mostra apenas 10 inicialmente
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.registration.toLowerCase().includes(term),
    );
    setFilteredStudents(filtered.slice(0, 20));
  }, [searchTerm, students]);

  const handleSelect = (student) => {
    setSelectedId(student._id);
    onSelect(student);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Buscar aluno..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
            disabled
          />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de busca */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaSearch />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar aluno por nome ou matrícula..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Lista de alunos */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FaUser className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Nenhum aluno encontrado</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm
              ? "Tente outro termo de busca"
              : "Nenhum aluno cadastrado no sistema"}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {filteredStudents.map((student) => (
            <button
              key={student._id}
              onClick={() => handleSelect(student)}
              disabled={!student.facialEmbedding}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                selectedId === student._id
                  ? "border-red-500 bg-red-50"
                  : student.facialEmbedding
                    ? "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`p-2 rounded-full ${
                    student.facialEmbedding ? "bg-gray-100" : "bg-gray-200"
                  }`}
                >
                  <FaUser
                    className={
                      student.facialEmbedding
                        ? "text-gray-700"
                        : "text-gray-500"
                    }
                  />
                </div>

                <div className="text-left flex-1">
                  <p
                    className={`font-medium ${
                      student.facialEmbedding
                        ? "text-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    {student.name}
                  </p>
                  <p
                    className={`text-sm flex items-center gap-1 ${
                      student.facialEmbedding
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    <FaIdCard size={12} />
                    {student.registration}
                  </p>
                </div>
              </div>

              {/* Status do embedding */}
              <div className="flex items-center gap-3">
                {student.facialEmbedding ? (
                  <>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Com embedding
                    </span>
                    {selectedId === student._id && (
                      <div className="p-1 bg-red-500 rounded-full">
                        <FaCheck className="text-white text-xs" />
                      </div>
                    )}
                  </>
                ) : (
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                    Sem facial
                  </span>
                )}
              </div>
            </button>
          ))}

          {/* Indicador de mais resultados */}
          {students.length > 20 && !searchTerm && (
            <p className="text-center text-sm text-gray-500 pt-2">
              Mostrando 10 de {students.length} alunos. Use a busca para
              encontrar específicos.
            </p>
          )}
        </div>
      )}

      {/* Rodapé informativo */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Com embedding facial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
          <span>Sem embedding</span>
        </div>
      </div>
    </div>
  );
}
