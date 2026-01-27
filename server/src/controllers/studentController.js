import controllerWrapper from "../utils/controllerWrapper.js";
import ApiResponse from "../utils/ApiResponse.js";
import StudentService from "../services/StudentService.js";

class StudentController {
    create = controllerWrapper(async (req, res) => {
        const student = await StudentService.create(req.body);
        return ApiResponse.CREATED(res, "Aluno criado com sucesso.", student);
    });

    getAll = controllerWrapper(async (req, res) => {
        let { page, limit, filter } = req.query;
        
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        filter = filter ? JSON.parse(filter) : {};

        if (page && limit) {
            const paginatedResult = await StudentService.getAllPaginated({page, limit, filter});
            return ApiResponse.OK_PAGINATED(res, "", paginatedResult.page, paginatedResult.limit, paginatedResult.totalPages, paginatedResult.items);
        }

    });

    getById = controllerWrapper(async (req, res) => {
        const student = await StudentService.getById(req.params.id);
        return ApiResponse.OK(res, "", student);
    });

    getByClassId = controllerWrapper(async (req, res) => {
        const { id } = req.params;
        const students = await StudentService.getByClassId(id);
        return ApiResponse.OK(res, "", students);
    });

    update = controllerWrapper(async (req, res) => {
        const updated = await StudentService.update(req.params.id, req.body);
        return ApiResponse.OK(res, "Aluno atualizado com sucesso.", updated);
    });

    delete = controllerWrapper(async (req, res) => {
        await StudentService.delete(req.params.id);
        return ApiResponse.NO_CONTENT(res);
    });

    updateFace = controllerWrapper(async (req, res) => {
        const { id } = req.params;
        const { embedding, nonce } = req.body;

        const updated = await StudentService.updateFaceData(id, embedding, nonce);
        return ApiResponse.OK(res, "Identificação facial atualizada com sucesso.", updated);
    });

    addClass = controllerWrapper(async(req, res) => {
        const { id, classCode } = req.params;

        if (req.user.role !== "coordenador"){
            // Usuário deve ser o professor autorizado da turma para ver os alunos
            const classData = await ClassService.getByCode(classCode);
            const isTeacherAuthorized = classData.teachers.some(t => t._id.toString() === req.user.id);
            
            if (!isTeacherAuthorized) {
                return ApiResponse.FORBIDDEN(res, "Acesso negado. Você não é professor desta turma.");
            }
        }
        
        const result = await StudentService.addClass(id, classCode);
        
        return ApiResponse.OK(
            res,
            "Aluno adicionado à turma com sucesso.",
            result
        );
    });

    removeClass = controllerWrapper(async (req, res) => {
        const { id, classCode } = req.params;

        if (req.user.role !== "coordenador") {
            // Usuário deve ser o professor autorizado da turma para ver os alunos
            const classData = await ClassService.getByCode(classCode);
            const isTeacherAuthorized = classData.teachers.some(t => t._id.toString() === req.user.id);

            if (!isTeacherAuthorized) {
                return ApiResponse.FORBIDDEN(res, "Acesso negado. Você não é professor desta turma.");
            }
        }
        
        const result = await StudentService.removeClass(id, classCode);

        return ApiResponse.OK(
            res,
            "Aluno removido da turma com sucesso.",
            result
        );
    });

    loadAllForFacialAPI = controllerWrapper(async (req, res) => {
        const students = await StudentService.loadAllFacesData();
        return ApiResponse.OK(res, "", students);
    });
}

export default new StudentController();
