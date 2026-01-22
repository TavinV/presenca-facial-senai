import Layout from "../components/layout/Layout";
import Search from "../components/ui/Search";
import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import useClassesSessions from "../hooks/useClassesSessions";
import useUsers from "../hooks/useUsers";
import { useClasses } from "../hooks/useClasses";

export default function ClassesSession() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isByTeacher = pathname.includes("/teachers/");

  const {
    sessions,
    loadByClass,
    loadByTeacher,
    deleteSession,
    closeSession,
    loading,
    error,
  } = useClassesSessions();

  const [filtered, setFiltered] = useState([]);

  const { teachers, loadUsers } = useUsers();
  const { classes, loadClasses } = useClasses();

  useEffect(() => {
    if (!id) {
      loadUsers();
      loadClasses();
    }
  }, [id, loadUsers, loadClasses]);

  useEffect(() => {
    if (!id) return;

    if (isByTeacher) {
      loadByTeacher(id);
    } else {
      loadByClass(id);
    }
  }, [id, isByTeacher, loadByClass, loadByTeacher]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltered(sessions || []);
  }, [sessions]);

  function handleSearch({ search }) {
    let res = sessions || [];
    if (search) {
      res = res.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (s.notes || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(res);
  }

  async function handleDelete(sessionId) {
    if (!confirm("Excluir sessão?")) return;
    await deleteSession(sessionId);
  }

  async function handleClose(sessionId) {
    await closeSession(sessionId);
  }

  const handleEdit = (id) => {
    console.log("SESSION ID:", id);
    navigate(`/class-sessions/${id}`);
  }

  return (
    <Layout>
      {!id && (
        <>
          <h2 className="text-xl font-bold mb-4">Sessões por Turma</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {classes.map((cls) => (
              <Link
                key={cls._id}
                to={`/class-sessions/class/${cls._id}`}
                className="border rounded p-4 hover:bg-gray-50"
              >
                <strong>{cls.name}</strong>
                <p className="text-sm text-gray-600">{cls.code}</p>
              </Link>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-4">Sessões por Professor</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <Link
                key={t._id}
                to={`/class-sessions/teacher/${t._id}`}
                className="border rounded p-4 hover:bg-gray-50"
              >
                <strong>{t.name}</strong>
                <p className="text-sm text-gray-600">{t.email}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {id && (
        <>
          <Search placeholder="Buscar sessões..." onChange={handleSearch} />

          {!isByTeacher && (
            <div className="flex justify-end mt-4">
              <Link
                to={`/class-sessions/`}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Nova sessão
              </Link>
            </div>
          )}

          {loading && <div className="mt-6">Carregando...</div>}
          {error && <div className="mt-6 text-red-600">{error}</div>}

          <div className="mt-6 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-gray-600">Nenhuma sessão encontrada.</div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s._id || s.id}
                  className="border rounded p-4 flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <p>
                      Data: {s.date ? new Date(s.date).toLocaleString() : "-"}
                    </p>
                    <p>Duração: {s.duration || "-"} min</p>
                    <p>Status: {s.isClosed ? "Fechada" : "Aberta"}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(session._id)}
                      className="px-3 py-1 bg-yellow-400 text-white rounded"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(s._id || s.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Excluir
                    </button>

                    <button
                      onClick={() => handleClose(s._id || s.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
