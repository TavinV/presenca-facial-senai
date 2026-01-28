import ApiResponse from "../utils/ApiResponse.js";
import ClassSessionService from "../services/ClassSessionService.js";
import controllerWrapper from "../utils/controllerWrapper.js";

const classSessionController = {
    /**
     * Criar sessão de aula
     * teacherId vem do JWT
     */
    create: controllerWrapper(async (req, res) => {
        const teacherId = req.user.id;
        const data = { ...req.body, teacherId };
        const session = await ClassSessionService.create(data);
        return ApiResponse.CREATED(res, "Sessão criada com sucesso.", session);
    }),

    /**
     * Buscar sessão por ID
     */
    getById: controllerWrapper(async (req, res) => {
        const session = await ClassSessionService.getById(req.params.id);
        return ApiResponse.OK(res, "", session);
    }),

    /**
     * Buscar sessões de uma turma
     */
    getByClass: controllerWrapper(async (req, res) => {
        const { classId } = req.params;
        const sessions = await ClassSessionService.getByClass(classId);
        return ApiResponse.OK(res, "", sessions);
    }),

    /**
     * Buscar sessões de um professor
     */
    getByTeacher: controllerWrapper(async (req, res) => {
        const { teacherId } = req.params;
        const sessions = await ClassSessionService.getByTeacher(teacherId);
        return ApiResponse.OK(res, "", sessions);
    }),

    /**
     * Buscar todas as sessões (coordenador)
     */
    getAll: controllerWrapper(async (req, res) => {
        if (req.user.role !== 'coordenador') {
            return ApiResponse.FORBIDDEN(res, "Acesso negado.");
        }
        const sessions = await ClassSessionService.getAll();
        return ApiResponse.OK(res, "", sessions);
    }),

    /**
     * Atualizar dados básicos da sessão
     */
    update: controllerWrapper(async (req, res) => {
        const session = await ClassSessionService.updateSession(
            req.params.id,
            req.body
        );
        return ApiResponse.OK(res, "Sessão atualizada com sucesso.", session);
    }),

    /**
     * Fechar sessão
     */
    closeSession: controllerWrapper(async (req, res) => {
        const session = await ClassSessionService.closeSession(req.params.id);
        return ApiResponse.OK(res, "Sessão fechada com sucesso.", session);
    }),

    /**
     * Deletar sessão
     */
    delete: controllerWrapper(async (req, res) => {
        await ClassSessionService.deleteSession(req.params.id);
        return ApiResponse.NO_CONTENT(res, "Sessão removida com sucesso.");
    }),
};

export default classSessionController;
