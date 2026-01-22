import { useEffect, useState } from "react";
import { useRooms } from "../../hooks/useRooms";

export default function RoomForm({
  mode = "create",
  initialData = {},
  onSubmit,
}) {
  const { createRoom, editRoom } = useRooms();
  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm((f) => ({
        ...f,
        name: initialData.name || "",
        code: initialData.code || "",
        location: initialData.location || "",
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
        const res = onSubmit ? await onSubmit(form) : await editRoom(id, form);
        if (!res?.success) throw new Error(res?.message || "Erro ao editar");
        alert("Sala atualizada com sucesso");
      } else {
        const res = onSubmit ? await onSubmit(form) : await createRoom(form);
        if (!res?.success) throw new Error(res?.message || "Erro ao criar");
        alert("Sala criada com sucesso");
        setForm({ name: "", code: "", location: "", isActive: true });
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

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código
          </label>
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Localização
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
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
          Ativa
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
