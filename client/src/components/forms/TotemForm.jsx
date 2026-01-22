import { useEffect, useState } from "react";
import { useTotems } from "../../hooks/useTotems";
import { useRooms } from "../../hooks/useRooms";

export default function TotemForm({
  mode = "create",
  initialData = {},
  onSubmit,
}) {
  const { createTotem, updateTotem } = useTotems();
  const { rooms, loadRooms } = useRooms();

  const [form, setForm] = useState({
    name: "",
    location: "",
    room: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm((f) => ({
        ...f,
        name: initialData.name || "",
        location: initialData.location || "",
        room: initialData.room?._id || initialData.room || "",
        isActive:
          typeof initialData.isActive === "boolean"
            ? initialData.isActive
            : true,
      }));
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
    try {
      if (mode === "edit") {
        const id = initialData.id || initialData._id;
        const res = onSubmit
          ? await onSubmit(form)
          : await updateTotem(id, form);
        if (res?.success === false)
          throw new Error(res.message || "Erro ao atualizar totem");
        alert("Totem atualizado");
      } else {
        const res = onSubmit ? await onSubmit(form) : await createTotem(form);
        if (res?.success === false)
          throw new Error(res.message || "Erro ao criar totem");
        alert("Totem criado");
        setForm({ name: "", location: "", room: "", isActive: true });
      }
    } catch (err) {
      alert(err.message || "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Localização
        </label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sala
        </label>
        <select
          name="room"
          value={form.room}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Selecione uma sala</option>
          {rooms?.map((r) => (
            <option key={r.id || r._id} value={r.id || r._id}>
              {r.name} - {r.code}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={form.isActive}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Ativo
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
        >
          {mode === "edit" ? "Salvar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
