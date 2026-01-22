import Layout from "../components/layout/Layout";
import Search from "../components/ui/Search";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTotems } from "../hooks/useTotems";

export default function TotemsPage() {
  const {
    totems,
    loadTotems,
    deleteTotem,
    toggleTotemStatus,
    getApiKey,
    regenerateApiKey,
  } = useTotems();
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    loadTotems();
  }, [loadTotems]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltered(totems || []);
  }, [totems]);

  function handleSearch({ search }) {
    let res = totems || [];
    if (search) {
      res = res.filter(
        (t) =>
          (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (t.location || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(res);
  }

  async function handleDelete(id) {
    if (!confirm("Excluir totem?")) return;
    await deleteTotem(id);
    setFiltered((prev) => prev.filter((p) => p.id !== id && p._id !== id));
  }

  async function handleToggle(id) {
    await toggleTotemStatus(id);
  }

  async function handleShowKey(id) {
    const key = await getApiKey(id);
    if (key) alert(`API Key: ${key}`);
    else alert("Não foi possível recuperar a key");
  }

  async function handleRegenerate(id) {
    const key = await regenerateApiKey(id);
    if (key) alert(`Nova API Key: ${key}`);
    else alert("Não foi possível gerar nova key");
  }

  return (
    <Layout>
      <Search placeholder="Buscar totems..." onChange={handleSearch} />

      <div className="flex justify-end mt-4">
        <Link
          to="/totems/new"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Novo totem
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-gray-600">Nenhum totem encontrado.</div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id || t._id}
              className="border rounded p-4 flex justify-between items-start"
            >
              <div>
                <h3 className="font-bold">{t.name}</h3>
                <p>Local: {t.location}</p>
                <p>Sala: {t.room?.name || t.room || "-"}</p>
                <p>Status: {t.isActive ? "Ativo" : "Inativo"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Link
                    to={`/totems/${t.id || t._id}/edit`}
                    className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id || t._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(t.id || t._id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Toggle status
                  </button>
                  <button
                    onClick={() => handleShowKey(t.id || t._id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Mostrar API Key
                  </button>
                  <button
                    onClick={() => handleRegenerate(t.id || t._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Regenerar Key
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
