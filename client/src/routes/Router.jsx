import { BrowserRouter, Router, Routes, Route } from "react-router-dom";
import { ROUTES } from "./index.js";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";

import FaceRecognitionPage from "../pages/FaceRecognitionPage.jsx";
import ClassesSessionPage from "../pages/ClassesSessionPage.jsx";
import AttendanceViewPage from "../pages/AttendanceViewPage.jsx";
import AttendanceReport from "../pages/AttendanceReport.jsx";
import AttendancePage from "../pages/AttendancePage.jsx";
import ClassViewPage from "../pages/ClassViewPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import StudentsPage from "../pages/StudentsPage.jsx";
import TeachersPage from "../pages/TeachersPage.jsx";
import ClassesPage from "../pages/ClassesPage.jsx";
import TotemsPage from "../pages/TotemsPage.jsx";
import CreatePage from "../pages/CreatePage.jsx";
import RoomsPage from "../pages/RoomsPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import AccessRequestPage from "../pages/AccessRequestPage.jsx";
import AccessRequestsAdminPage from "../pages/AccessRequestsAdminPage.jsx";
import EditPage from "../pages/EditPage.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.PUBLIC.LOGIN} element={<LoginPage />}></Route>
        <Route
          path={ROUTES.PRIVATE.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.CLASSES.LIST}
          element={
            <ProtectedRoute>
              <ClassesPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.CLASSES.EDIT}
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.CLASSES.CREATE}
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.CLASSES.OVERVIEW}
          element={<ClassViewPage />}
        ></Route>
        <Route
          path={ROUTES.PRIVATE.STUDENTS.LIST}
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.STUDENTS.CREATE}
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.STUDENTS.DETAIL}
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.STUDENTS.EDIT}
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.TEACHERS.LIST}
          element={
            <ProtectedRoute>
              <TeachersPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.TEACHERS.CREATE}
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.TEACHERS.EDIT}
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.ROOMS.LIST}
          element={
            <ProtectedRoute>
              <RoomsPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.ROOMS.CREATE}
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.ROOMS.EDIT}
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.TOTEMS.LIST}
          element={
            <ProtectedRoute>
              <TotemsPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.TOTEMS.CREATE}
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.TOTEMS.EDIT}
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.SESSIONS.LIST}
          element={
            <ProtectedRoute>
              <ClassesSessionPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.SESSIONS.BY_CLASS}
          element={
            <ProtectedRoute>
              <ClassesSessionPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.SESSIONS.BY_TEACHER}
          element={
            <ProtectedRoute>
              <ClassesSessionPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.SESSIONS.CREATE}
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.SESSIONS.EDIT}
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PUBLIC.TOTEM}
          element={<FaceRecognitionPage />}
        ></Route>
        <Route
          path={ROUTES.PRIVATE.ATTENDANCE.CLASS_SESSION_ATTENDANCES} 
          element={
            <ProtectedRoute>
              <AttendanceViewPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.ATTENDANCE.MANUAL}
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PUBLIC.REQUEST_ACCESS}
          element={<AccessRequestPage />}
        ></Route>

        <Route
          path={ROUTES.PRIVATE.ACCESS_REQUESTS}
          element={
            <ProtectedRoute>
              <AccessRequestsAdminPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path={ROUTES.PRIVATE.REPORTS.MAIN}
          element={
            <ProtectedRoute>
              <AttendanceReport />
            </ProtectedRoute>
          }
        ></Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
