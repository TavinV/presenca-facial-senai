import ApiResponse from "../utils/ApiResponse.js";
import AttendanceService from "../services/AttendanceService.js";
import controllerWrapper from "../utils/controllerWrapper.js";

const attendanceController = {

    // Registrar presença via reconhecimento facial
    markByFace: controllerWrapper(async (req, res) => {
        const { facialId, sessionId } = req.body;
        const attendance = await AttendanceService.markPresenceByFace(
            facialId,
            sessionId
        );

        return ApiResponse.CREATED(
            res,
            "Presença registrada via reconhecimento facial.",
            attendance
        );
    }),

    // Registrar presença manual
    markManual: controllerWrapper(async (req, res) => {
        const { sessionId, studentId, status } = req.body;

        const attendance = await AttendanceService.markPresenceManual({
            sessionId,
            studentId,
            status,
            recordedBy: req.user.id
        });

        return ApiResponse.CREATED(
            res,
            "Presença registrada manualmente.",
            attendance
        );
    }),

    // Listar presenças de uma sessão
    getBySession: controllerWrapper(async (req, res) => {
        const sessionId = req.params.sessionId;

        const records = await AttendanceService.getAll({
            sessionId
        });

        return ApiResponse.OK(res, "", records);
    }),

    // Atualizar presença (status, check-in, etc.)
    update: controllerWrapper(async (req, res) => {
        const { id } = req.params;

        const updated = await AttendanceService.update(id, req.body);

        return ApiResponse.OK(res, "Presença atualizada com sucesso.", updated);
    }),

    // Remover uma presença (útil para corrigir erros)
    delete: controllerWrapper(async (req, res) => {
        const { id } = req.params;

        await AttendanceService.delete(id);

        return ApiResponse.NO_CONTENT(res, "Registro de presença removido com sucesso.");
    })
};

export default attendanceController;
