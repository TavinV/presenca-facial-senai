import StudentForm from "../components/forms/StudentForm";
import TeacherForm from "../components/forms/TeacherForm";
import ClassForm from "../components/forms/ClassForm";
import ClassSession from "../components/forms/ClassSessionForm";
import RoomForm from "../components/forms/RoomForm";
import TotemForm from "../components/forms/TotemForm";

//Hooks
import useClassesSessions from "../hooks/useClassesSessions";
import { useClasses } from "../hooks/useClasses";
import { useStudents } from "../hooks/useStudents";
import { useRooms } from "../hooks/useRooms";
import { useTotems } from "../hooks/useTotems";

import Layout from "../components/layout/Layout";

import { useLocation } from "react-router-dom";

export default function CreatePage() {
  const { pathname } = useLocation();

  const type = pathname.split("/")[1];

  const { createClass } = useClasses();
  const { createStudent } = useStudents();
  const { createRoom } = useRooms();
  const { createTotem } = useTotems();
  const { createSession } = useClassesSessions();

  function renderForm() {
    switch (type) {
      case "classes":
        return <ClassForm mode="create" onSubmit={createClass} />;
      case "students":
        return <StudentForm mode="create" onSubmit={createStudent} />;
      case "rooms":
        return <RoomForm mode="create" onSubmit={createRoom} />;
      case "totems":
        return <TotemForm mode="create" onSubmit={createTotem} />;
      case "teachers":
        return <TeacherForm />;
      case "class-sessions":
        return <ClassSession mode="create" onSubmit={createSession} />;
      default:
        return <div>Tipo inválido</div>;
    }
  }

  return (
    <Layout>
      <div>{renderForm()}</div>
    </Layout>
  );
}
