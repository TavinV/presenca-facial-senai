import ApiResponse from "../utils/ApiResponse.js";
import ClassService from "../services/ClassService.js";
import StudentService from "../services/StudentService.js";
import controllerWrapper from "../utils/controllerWrapper.js";

const classController = {
    // Criar turma
    create: controllerWrapper(async (req, res) => {
        const classData = await ClassService.create(req.body);
        return ApiResponse.CREATED(res, "Turma criada com sucesso.", classData);
    }),

    // Listar todas as turmas
    getAll: controllerWrapper(async (req, res) => {
        const classes = await ClassService.getAll();
        return ApiResponse.OK(res, "", classes);
    }),

    // Buscar turma pelo ID
    getById: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const classData = await ClassService.getById(id);
        return ApiResponse.OK(res, "", classData);
    }),

    // Buscar turma pelo código (ex: I2P4) — rota /name/:name
    getByName: controllerWrapper(async (req, res) => {
        const { name } = req.params;
        // delega ao service que usa 'code' internamente
        const classData = await ClassService.getByCode(name);
        return ApiResponse.OK(res, "", classData);
    }),

    // Atualizar turma
    update: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const updatedClass = await ClassService.updateClass(id, req.body);
        return ApiResponse.OK(res, "Turma atualizada com sucesso.", updatedClass);
    }),

    // Deletar turma
    delete: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        await ClassService.delete(id);
        return ApiResponse.NO_CONTENT(res, "Turma deletada com sucesso.");
    }),

    // Listar professores autorizados da turma
    getTeachers: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const classData = await ClassService.getTeachers(id);

        if (!classData) {
            return ApiResponse.NOTFOUND(res, "Turma não encontrada.");
        }

        return ApiResponse.OK(res, "", classData.teachers || []);
    }),

    // Adicionar professor autorizado à turma
    addTeacher: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const teacherId = req.params.teacherId;
        const updatedClass = await ClassService.addTeacher(id, teacherId);
        return ApiResponse.OK(res, "Professor adicionado à turma com sucesso.", updatedClass);
    }),

    // Remover professor autorizado da turma
    removeTeacher: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const teacherId = req.params.teacherId;
        const updatedClass = await ClassService.removeTeacher(id, teacherId);
        return ApiResponse.OK(res, "Professor removido da turma com sucesso.", updatedClass);
    }),

    getStudents: controllerWrapper(async (req, res) =>{
        const id = req.params.id;
        const students = await StudentService.getByClassCode(id);
        return ApiResponse.OK(res, "", students);        
    })
};

export default classController;
