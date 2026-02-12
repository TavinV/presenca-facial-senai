import ApiResponse from "../utils/ApiResponse.js";
import ClassSessionService from "../services/ClassSessionService.js";
import controllerWrapper from "../utils/controllerWrapper.js";

const classSessionController = {
    /**
     * Criar sessão de aula
     * teacherId vem do JWT
     */
    create: controllerWrapper(async (req, res) => {
        let teacherId;
        let byCoordinator = false;

        if (req.user.role !== 'professor') {
            byCoordinator = true;
            if (!req.body.teacher) {
                return ApiResponse.BADREQUEST(res, "O ID do professor é obrigatório.");
            } else {
                teacherId = req.body.teacher;
            }
        } else {
            teacherId = req.user.id;
        }

        let data = { ...req.body, byCoordinator };
        if (!data.teacherId) {
            data.teacherId = teacherId;
        }

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
            const forbiddenFields = ["status", "closedAt"];

    for (const field of forbiddenFields) {
        if (req.body[field] !== undefined) {
                return ApiResponse.BADREQUEST(
                    res,
                    `Não é permitido alterar o campo '${field}' manualmente.`
                );
            }
        }
        if (req.body.endsAt === null) {
            return ApiResponse.BADREQUEST(res, "O campo 'endsAt' não pode ser removido.");
        }
        
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
