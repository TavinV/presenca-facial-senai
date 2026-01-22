import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useClasses } from "../hooks/useClasses.jsx";

export function ClassViewPage() {
  const { id: classCode } = useParams();
  const { students, loading, error, getStudents } = useClasses();

  useEffect(() => {
    if (classCode) getStudents(classCode);
  }, [classCode, getStudents]);
  return (
    <Layout>
      <div style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 12 }}>Turma: {classCode || "—"}</h2>

        {loading && <p>Carregando alunos...</p>}
        {error && <p style={{ color: "crimson" }}>{error}</p>}

        {!loading && !error && students.length === 0 && (
          <p>Nenhum aluno encontrado para esta turma.</p>
        )}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {students.map((student) => (
            <li
              key={student._id}
              style={{
                marginBottom: 10,
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 6,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 700 }}>{student.name}</div>
              <div style={{ fontSize: 12, color: "#444" }}>
                {student.registration}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

export default ClassViewPage;
