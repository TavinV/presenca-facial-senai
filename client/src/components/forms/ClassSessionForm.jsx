import { useEffect, useState } from "react";
import useClassesSessions from "../../hooks/useClassesSessions";
import useUsers from "../../hooks/useUsers";
import { useRooms } from "../../hooks/useRooms";
import { useClasses } from "../../hooks/useClasses";

export default function ClassSessionForm({
  mode = "create",
  initialData = {},
  onSubmit,
  classId: fixedClassId,
}) {
  const { createSession, updateSession } = useClassesSessions();
  const { teachers, loadUsers } = useUsers();
  const { rooms, loadRooms } = useRooms();
  const { classes, loadClasses } = useClasses();

  const [form, setForm] = useState({
    name: "",
    date: "",
    notes: "",
    classId: fixedClassId || "",
    room: "",
    teacher: "",
    isClosed: false,
  });

  const [submitting, setSubmitting] = useState(false);

  // 🔹 Carregar dados auxiliares
  useEffect(() => {
    loadUsers();
    loadRooms();
    loadClasses();
  }, [loadUsers, loadRooms, loadClasses]);

  // 🔹 Preencher no EDIT
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name || "",
        classId: initialData.classId || "",
        date: initialData.date ? initialData.date.substring(0, 16) : "",
        room: initialData.room || "",
        notes: initialData.notes || "",
        teacher: initialData.teacher || ""
      });
    }
  }, [mode, initialData]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    // 🔹 Payload no formato do backend
    const payload = {
      name: form.name,
      date: new Date(form.date).toISOString(),
      notes: form.notes,
      classId: form.classId,
      room: form.room,
      teacher: form.teacher,
      status: form.isClosed ? "closed" : "active",
    };

    try {
      let res;
      if (mode === "edit") {
        const id = initialData._id || initialData.id;
        res = onSubmit
          ? await onSubmit(payload)
          : await updateSession(id, payload);
      } else {
        res = onSubmit ? await onSubmit(payload) : await createSession(payload);
      }

      if (!res?.success) {
        throw new Error(res?.message || "Erro ao salvar sessão");
      }

      alert(mode === "edit" ? "Sessão atualizada" : "Sessão criada");
    } catch (err) {
      alert(err.message || "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {/* TÍTULO */}
      <input
        name="title"
        value={form.name}
        onChange={handleChange}
        placeholder="Título da aula"
        required
        className="w-full border px-3 py-2 rounded"
      />

      {/* DATA */}
      <input
        type="datetime-local"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      />

      {/* TURMA */}
      <select
        name="classId"
        value={form.classId}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Selecione a turma</option>
        {classes.map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.code}
          </option>
        ))}
      </select>

      {/* SALA */}
      <select
        name="room"
        value={form.room}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Selecione a sala</option>
        {rooms.map((room) => (
          <option key={room._id} value={room._id}>
            {room.name}
          </option>
        ))}
      </select>

      {/* PROFESSOR */}
      <select
        name="teacher"
        value={form.teacher}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Selecione o professor</option>
        {teachers.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* NOTAS */}
      <textarea
        name="notes"
        value={form.notes}
        onChange={handleChange}
        placeholder="Observações"
        className="w-full border px-3 py-2 rounded"
      />

      {/* FECHADA */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isClosed"
          checked={form.isClosed}
          onChange={handleChange}
        />
        Sessão encerrada
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        {mode === "edit" ? "Salvar" : "Criar"}
      </button>
    </form>
  );
}
