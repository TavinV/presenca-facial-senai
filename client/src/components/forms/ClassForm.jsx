import useClasses from "../../hooks/useClasses";
import { useUsers } from "../../hooks/useUsers";
import * as RoomsHook from "../../hooks/useRooms";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaDoorOpen,
  FaCalendarAlt,
  FaClock,
  FaCode,
  FaSave,
  FaPlus,
  FaEdit,
  FaCheckCircle,
  FaBuilding,
  FaUsers,
  FaCheck,
  FaTimes,
  FaBook,
} from "react-icons/fa";

const ClassForm = ({ mode = "create", initialData = null, onSubmit }) => {
  const { addTeacher, addRoom } = useClasses();
  const { users, loadUsers } = useUsers();

  const resolvedUseRooms = RoomsHook.default || RoomsHook.useRooms;
  const { rooms, loadRooms } = resolvedUseRooms();

  const [code, setCode] = useState("");
  const [course, setCourse] = useState("");
  const [shift, setShift] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  // 🔹 Preencher dados no EDIT
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setCode(initialData.code || "");
      setCourse(initialData.course || "");
      setShift(initialData.shift || "");
      setSubjects(initialData.subjects || initialData.subject || []);
      setYear(initialData.year || new Date().getFullYear());
      setSelectedTeachers(
        (initialData.teachers || []).map((t) =>
          String(typeof t === "string" ? t : t._id || t.id || ""),
        ),
      );
      setSelectedRooms(
        (initialData.rooms || []).map((r) =>
          String(typeof r === "string" ? r : r._id || r.id || ""),
        ),
      );
      // reset subject editing inputs
      setSubjectCode("");
      setSubjectName("");
      setEditingSubjectIndex(null);
    }
  }, [mode, initialData]);

  // Subjects temporary inputs
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);

  const addOrUpdateSubject = () => {
    const code = (subjectCode || "").trim();
    const name = (subjectName || "").trim();
    if (!code || !name) return;
    if (editingSubjectIndex !== null && editingSubjectIndex >= 0) {
      setSubjects((prev) =>
        prev.map((s, i) => (i === editingSubjectIndex ? { code, name } : s)),
      );
      setEditingSubjectIndex(null);
    } else {
      setSubjects((prev) => [...prev, { code, name }]);
    }
    setSubjectCode("");
    setSubjectName("");
  };

  const editSubject = (index) => {
    const s = subjects[index];
    if (!s) return;
    setSubjectCode(s.code || "");
    setSubjectName(s.name || "");
    setEditingSubjectIndex(index);
  };

  const removeSubject = (index) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
    // reset editing if removed
    if (editingSubjectIndex === index) {
      setEditingSubjectIndex(null);
      setSubjectCode("");
      setSubjectName("");
    }
  };

  useEffect(() => {
    loadUsers();
    loadRooms();
  }, [loadUsers, loadRooms]);

  const teachers = users.filter((user) => user.role === "professor");

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    // Ensure types/formats match server validation
    const payload = {
      code,
      course,
      shift,
      year: Number(year),
      subjects: (subjects || []).map((s) => ({
        code: (s.code || "").toUpperCase(),
        name: s.name,
      })),
    };

    const result = await onSubmit(payload);

    if (result?.success && result.data) {
      const classId = result.data._id || result.data.id;

      for (const teacherId of selectedTeachers) {
        await addTeacher(classId, teacherId);
      }

      for (const roomId of selectedRooms) {
        await addRoom(classId, roomId);
      }
      // Redirect to the classes list after successful create/edit
      navigate(`/classes`);
      return;
    }

    setIsSubmitting(false);
  }

  const toggleTeacher = (id) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleRoom = (id) => {
    setSelectedRooms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {mode === "edit" ? "Editar Turma" : "Criar Nova Turma"}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === "edit"
              ? "Atualize os dados da turma selecionada"
              : "Cadastre uma nova turma no sistema de presença facial"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-lg mr-4">
                <FaUserGraduate className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === "edit" ? "Edição de Turma" : "Cadastro de Turma"}
                </h2>
                <p className="text-red-100 mt-1">
                  {mode === "edit"
                    ? "Atualize as informações da turma abaixo"
                    : "Preencha todos os campos obrigatórios para criar uma nova turma"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Campos Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    <div className="flex items-center">
                      <FaCode className="text-red-600 mr-2" />
                      Código da Turma *
                    </div>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: TURMA-2024-A"
                  />
                </div>

                {/* Curso */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    <div className="flex items-center">
                      <FaUserGraduate className="text-red-600 mr-2" />
                      Curso *
                    </div>
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: Desenvolvimento de Sistemas"
                  />
                </div>

                {/* Turno */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    <div className="flex items-center">
                      <FaClock className="text-red-600 mr-2" />
                      Turno *
                    </div>
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
                  >
                    <option value="">Selecione o turno</option>
                    <option value="manhã">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>

                {/* Período */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-red-600 mr-2" />
                      Período *
                    </div>
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: 2024"
                    min="2000"
                    max="2100"
                  />
                </div>

                {/* DISCIPLINAS / SUBJECTS */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <FaBook className="text-red-600 text-xl mr-3" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Disciplinas
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Adicione as disciplinas (código e nome) desta turma
                      </p>
                    </div>
                    <span className="ml-auto bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {subjects.length} disciplina(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Código (ex: BD)"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Nome da disciplina"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg"
                    />
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={addOrUpdateSubject}
                        className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg w-full"
                      >
                        {editingSubjectIndex !== null
                          ? "Atualizar"
                          : "Adicionar"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s, idx) => (
                      <div
                        key={`${s.code}-${idx}`}
                        className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full"
                      >
                        <div className="text-left mr-3">
                          <div className="font-medium">{s.code}</div>
                          <div className="text-xs text-gray-600">{s.name}</div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => editSubject(idx)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSubject(idx)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Professores */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <FaChalkboardTeacher className="text-red-600 text-xl mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Professores
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Selecione os professores desta turma
                    </p>
                  </div>
                  <span className="ml-auto bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {selectedTeachers.length} selecionado(s)
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {teachers.map((teacher) => {
                    const id = String(teacher._id || teacher.id || "");
                    const selected = selectedTeachers.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleTeacher(id)}
                        className={`inline-flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
                          selected
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:shadow-sm"
                        }`}
                      >
                        <FaUsers
                          className={`mr-2 ${
                            selected ? "text-white" : "text-gray-400"
                          }`}
                        />
                        <span className="font-medium">{teacher.name}</span>
                        {selected && (
                          <FaCheckCircle className="ml-2 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {teachers.length === 0 && (
                  <div className="text-center py-6">
                    <FaChalkboardTeacher className="text-gray-300 text-4xl mx-auto mb-3" />
                    <p className="text-gray-500">
                      Nenhum professor cadastrado no sistema
                    </p>
                  </div>
                )}
              </div>

              {/* Salas */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <FaDoorOpen className="text-red-600 text-xl mr-3" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Salas</h3>
                    <p className="text-gray-600 text-sm">
                      Selecione as salas desta turma
                    </p>
                  </div>
                  <span className="ml-auto bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {selectedRooms.length} selecionada(s)
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {rooms.map((room) => {
                    const id = String(room._id || room.id || "");
                    const selected = selectedRooms.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleRoom(id)}
                        className={`inline-flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
                          selected
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:shadow-sm"
                        }`}
                      >
                        <FaBuilding
                          className={`mr-2 ${
                            selected ? "text-white" : "text-gray-400"
                          }`}
                        />
                        <div className="text-left">
                          <span className="font-medium block">{room.name}</span>
                          <span
                            className={`text-xs ${
                              selected ? "text-red-100" : "text-gray-500"
                            }`}
                          >
                            {room.location || "Local não especificado"}
                          </span>
                        </div>
                        {selected && <FaCheck className="ml-2 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {rooms.length === 0 && (
                  <div className="text-center py-6">
                    <FaDoorOpen className="text-gray-300 text-4xl mx-auto mb-3" />
                    <p className="text-gray-500">
                      Nenhuma sala cadastrada no sistema
                    </p>
                  </div>
                )}
              </div>

              {/* Resumo */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FaCheckCircle className="text-red-600 text-xl mr-3" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Resumo da Turma
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Código:</span>
                      <span className="font-semibold text-gray-800">
                        {code || "Não informado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Curso:</span>
                      <span className="font-semibold text-gray-800">
                        {course || "Não informado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Turno:</span>
                      <span className="font-semibold text-gray-800">
                        {shift === "manha"
                          ? "Manhã"
                          : shift === "tarde"
                            ? "Tarde"
                            : shift === "noite"
                              ? "Noite"
                              : "Não informado"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Período:</span>
                      <span className="font-semibold text-gray-800">
                        {year || "Não informado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Professores:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedTeachers.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salas:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedRooms.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    Campos marcados com * são obrigatórios
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCode("");
                      setCourse("");
                      setShift("");
                      setYear(new Date().getFullYear());
                      setSelectedTeachers([]);
                      setSelectedRooms([]);
                      setSubjects([]);
                      setSubjectCode("");
                      setSubjectName("");
                      setEditingSubjectIndex(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Limpar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        {mode === "edit" ? (
                          <>
                            <FaSave className="mr-2" />
                            Salvar Alterações
                          </>
                        ) : (
                          <>
                            <FaPlus className="mr-2" />
                            Criar Turma
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Status do Sistema */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <FaChalkboardTeacher className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Professores Disponíveis</p>
                <p className="text-2xl font-bold text-gray-800">
                  {teachers.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <FaDoorOpen className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Salas Disponíveis</p>
                <p className="text-2xl font-bold text-gray-800">
                  {rooms.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <FaCalendarAlt className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ano Atual</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassForm;
