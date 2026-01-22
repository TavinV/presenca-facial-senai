import ClassForm from "../components/forms/ClassForm";
import StudentForm from "../components/forms/StudentForm";
import TeacherForm from "../components/forms/TeacherForm";
import RoomForm from "../components/forms/RoomForm";
import TotemForm from "../components/forms/TotemForm";
import ClassSessionForm from "../components/forms/ClassSessionForm";

import useClassesSessions from "../hooks/useClassesSessions";
import { useClasses } from "../hooks/useClasses";
import { useStudents } from "../hooks/useStudents";
import { useRooms } from "../hooks/useRooms";
import { useTotems } from "../hooks/useTotems";
import useUsers from "../hooks/useUsers";

import Layout from "../components/layout/Layout";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EditPage() {
  const { pathname } = useLocation();
  const { id } = useParams();

  const type = pathname.split("/")[1];

  const { classes, loadClasses, updateClass } = useClasses();
  const { students, loadStudents, updateStudent } = useStudents();
  const { users, loadUsers, updateUser } = useUsers();
  const { rooms, loadRooms, editRoom } = useRooms();
  const { totems, loadTotems, updateTotem } = useTotems();
  const { getById, updateSession } = useClassesSessions();

  const [sessionData, setSessionData] = useState(null);


  const isClassSessionEdit =
    pathname.startsWith("/class-sessions/") &&
    !pathname.endsWith("/active") &&
    !pathname.endsWith("/report");

  useEffect(() => {
    if (type === "classes") loadClasses();
    if (type === "students") loadStudents();
    if (type === "teachers") loadUsers();
    if (type === "rooms") loadRooms();
    if (type === "totems") loadTotems();
  }, [type]);

  useEffect(() => {
    if (isClassSessionEdit) {
      (async () => {
        const res = await getById(id);
        if (res?.success) {
          setSessionData(res.data);
        }
      })();
    }
  }, [isClassSessionEdit, id]); 


  // 🔒 Proteção de render
  if (isClassSessionEdit && !sessionData) {
    return (
      <Layout>
        <div>Carregando sessão...</div>
      </Layout>
    );
  }

  function renderEdit() {
    if (isClassSessionEdit) {
      return (
        <ClassSessionForm
          mode="edit"
          initialData={sessionData}
          onSubmit={(data) => updateSession(id, data)}
        />
      );
    }

    switch (type) {
      case "classes":
        return (
          <ClassForm
            mode="edit"
            initialData={classes.find((c) => (c._id || c.id) === id)}
            onSubmit={(data) => updateClass(id, data)}
          />
        );

      case "students":
        return (
          <StudentForm
            mode="edit"
            initialData={students.find((s) => (s._id || s.id) === id)}
            onSubmit={(data) => updateStudent(id, data)}
          />
        );

      case "teachers":
        return (
          <TeacherForm
            mode="edit"
            initialData={users.find((u) => (u._id || u.id) === id)}
            onSubmit={(data) => updateUser(id, data)}
          />
        );

      case "rooms":
        return (
          <RoomForm
            mode="edit"
            initialData={rooms.find((r) => (r._id || r.id) === id)}
            onSubmit={(data) => editRoom(id, data)}
          />
        );

      case "totems":
        return (
          <TotemForm
            mode="edit"
            initialData={totems.find((t) => (t._id || t.id) === id)}
            onSubmit={(data) => updateTotem(id, data)}
          />
        );

      default:
        return <div>Tipo inválido</div>;
    }
  }

  return <Layout>{renderEdit()}</Layout>;
}
