import ApiResponse from "../utils/ApiResponse.js";
import ClassSessionService from "../services/ClassSessionService.js";
import controllerWrapper from "../utils/controllerWrapper.js";

const classSessionController = {
    // Criar sessão
    create: controllerWrapper(async (req, res) => {
        const teacherId = req.user.id;
        const data = {...req.body, teacherId};
        const session = await ClassSessionService.create(data);
        return ApiResponse.CREATED(res, "Sessão criada com sucesso.", session);
    }),

    // Buscar sessão por ID
    getById: controllerWrapper(async (req, res) => {
        const session = await ClassSessionService.getById(req.params.id);
        return ApiResponse.OK(res, "", session);
    }),

    // Buscar sessões de uma turma
    getByClass: controllerWrapper(async (req, res) => {
        const sessions = await ClassSessionService.getAll({
            classId: req.params.classId
        });
        return ApiResponse.OK(res, "", sessions);
    }),

    // Buscar sessões de um professor
    getByTeacher: controllerWrapper(async (req, res) => {
        const sessions = await ClassSessionService.getAll({
            teacherId: req.params.teacherId
        });
        return ApiResponse.OK(res, "", sessions);
    }),

    // Atualizar sessão
    update: controllerWrapper(async (req, res) => {
        const session = await ClassSessionService.update(req.params.id, req.body);
        return ApiResponse.OK(res, "Sessão atualizada com sucesso.", session);
    }),

    // Fechar sessão
    closeSession: controllerWrapper(async (req, res) => {
        const session = await ClassSessionService.closeSession(req.params.id);
        return ApiResponse.OK(res, "Sessão fechada com sucesso.", session);
    }),

    // Reset total de presença
    resetSession: controllerWrapper(async (req, res) => {
        const session = await ClassSessionService.resetSessionAttendances(req.params.id);
        return ApiResponse.OK(res, "Sessão resetada com sucesso.", session);
    }),

    // Deletar sessão
    delete: controllerWrapper(async (req, res) => {
        await ClassSessionService.delete(req.params.id);
        return ApiResponse.NO_CONTENT(res, "Sessão removida com sucesso.");
    }),

    // Atualizar registro individual de presença
    updateStudentRecord: controllerWrapper(async (req, res) => {
        const { id, studentId } = req.params;
        const attendance = await ClassSessionService.updateAttendance(
            id,
            studentId,
            req.body
        );
        return ApiResponse.OK(res, "Presença atualizada com sucesso.", attendance);
    }),

    // Buscar todos os registros de presença da sessão
    getAttendanceRecords: controllerWrapper(async (req, res) => {
        const records = await ClassSessionService.getAttendanceBySession(req.params.id);
        return ApiResponse.OK(res, "", records);
    }),
};

export default classSessionController;
