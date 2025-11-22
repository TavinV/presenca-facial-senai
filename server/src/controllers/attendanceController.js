import ApiResponse from "../utils/ApiResponse.js";
import AttendanceService from "../services/AttendanceService.js";
import controllerWrapper from "../utils/controllerWrapper.js";
import ClassSessionService from "../services/ClassSessionService.js";
import ClassService from "../services/ClassService.js";

const attendanceController = {

    // --- REGISTRO DE PRESENÇA ---

    markByFace: controllerWrapper(async (req, res) => {
        const { facialId, sessionId } = req.body;
        const attendance = await AttendanceService.markPresenceByFace(facialId, sessionId);

        return ApiResponse.CREATED(res, "Presença registrada.", attendance);
    }),

    markManual: controllerWrapper(async (req, res) => {
        const { classSessionId, studentId, status } = req.body;

        const session = await ClassSessionService.getById(classSessionId);
        console.log(session);
        if (req.user.role !== "coordenador") {
            const teachers = await ClassService.getTeachers(session.classId);
            const isTeacherFromClass = teachers?.some(
                (t) => t?._id.toString() === req.user.id.toString()
            );

            if (!isTeacherFromClass)
                return ApiResponse.FORBIDDEN(res, "Você não pode registrar presenças nesta turma.");
        }

        const attendance = await AttendanceService.markPresenceManual({
            sessionId: classSessionId,
            studentId,
            status,
            recordedBy: req.user.id
        });

        return ApiResponse.CREATED(res, "Presença registrada.", attendance);
    }),

    // --- CONSULTAS SIMPLES ---

    getBySession: controllerWrapper(async (req, res) => {
        const sessionId = req.params.sessionId;
        const records = await AttendanceService.getAll({ sessionId });
        return ApiResponse.OK(res, "", records);
    }),

    getByStudent: controllerWrapper(async (req, res) => {
        const { studentId } = req.params;
        const records = await AttendanceService.getAll({ student: studentId });
        return ApiResponse.OK(res, "", records);
    }),

    getTodayByClass: controllerWrapper(async (req, res) => {
        const { classCode } = req.params;

        const records = await AttendanceService.getTodayByClass(classCode);
        return ApiResponse.OK(res, "", records);
    }),

    getRangeByClass: controllerWrapper(async (req, res) => {
        const { classCode } = req.params;
        const { start, end } = req.query;

        const records = await AttendanceService.getRangeByClass(classCode, start, end);
        return ApiResponse.OK(res, "", records);
    }),

    // --- RELATÓRIO COMPLETO DA SESSÃO ---

    getFullReportBySession: controllerWrapper(async (req, res) => {
        const { sessionId } = req.params;
        const report = await AttendanceService.getFullReportBySession(sessionId);
        return ApiResponse.OK(res, "", report);
    }),

    // --- AUSÊNCIAS AUTOMÁTICAS ---

    markAbsencesForSession: controllerWrapper(async (req, res) => {
        const { sessionId } = req.params;
        const result = await AttendanceService.markAbsencesForSession(sessionId);
        return ApiResponse.OK(res, "Ausências geradas.", result);
    }),

    // --- UPDATE E DELETE ---

    update: controllerWrapper(async (req, res) => {
        const updated = await AttendanceService.update(req.params.id, req.body);
        return ApiResponse.OK(res, "Presença atualizada.", updated);
    }),

    delete: controllerWrapper(async (req, res) => {
        await AttendanceService.delete(req.params.id);
        return ApiResponse.NO_CONTENT(res, "Registro removido.");
    })
};

export default attendanceController;
