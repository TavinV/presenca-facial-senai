import ApiResponse from "../utils/ApiResponse.js";
import ClassService from "../services/ClassService.js";
import StudentService from "../services/StudentService.js";
import controllerWrapper from "../utils/controllerWrapper.js";

const classController = {
    create: controllerWrapper(async (req, res) => {
        const classData = await ClassService.create(req.body);
        return ApiResponse.CREATED(res, "Turma criada com sucesso.", classData);
    }),

    getAll: controllerWrapper(async (req, res) => {
        const classes = await ClassService.getAll();
        return ApiResponse.OK(res, "", classes);
    }),

    getById: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const classData = await ClassService.getById(id);
        return ApiResponse.OK(res, "", classData);
    }),

    // Buscar turma pelo código (ex: I2P4)
    getByName: controllerWrapper(async (req, res) => {
        const { name } = req.params;
        const classData = await ClassService.getByCode(name);
        return ApiResponse.OK(res, "", classData);
    }),

    update: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const updatedClass = await ClassService.updateClass(id, req.body);
        return ApiResponse.OK(res, "Turma atualizada com sucesso.", updatedClass);
    }),

    delete: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        await ClassService.delete(id);
        return ApiResponse.NO_CONTENT(res, "Turma deletada com sucesso.");
    }),

    /* ==========================
       PROFESSORES
    ========================== */

    getClassesByTeacher: controllerWrapper(async (req, res) => {
        const teacherId = req.user.id;
        const classes = await ClassService.getClassesByTeacher(teacherId);
        return ApiResponse.OK(res, "", classes);
    }),

    getTeachers: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const classData = await ClassService.getTeachers(id);
        return ApiResponse.OK(res, "", classData.teachers || []);
    }),

    addTeacher: controllerWrapper(async (req, res) => {
        const { id, teacherId } = req.params;
        const updatedClass = await ClassService.addTeacher(id, teacherId);
        return ApiResponse.OK(res, "Professor adicionado à turma com sucesso.", updatedClass);
    }),

    removeTeacher: controllerWrapper(async (req, res) => {
        const { id, teacherId } = req.params;
        const updatedClass = await ClassService.removeTeacher(id, teacherId);
        return ApiResponse.OK(res, "Professor removido da turma com sucesso.", updatedClass);
    }),

    /* ==========================
       SALAS (ROOMS)
    ========================== */

    getRooms: controllerWrapper(async (req, res) => {
        const classData = await ClassService.getById(req.params.id);

        if (!classData) {
            return ApiResponse.NOTFOUND(res, "Turma não encontrada.");
        }

        // popula os dados das rooms
        await classData.populate("rooms");

        return ApiResponse.OK(res, "", classData.rooms || []);
    }),


    setRooms: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const { rooms } = req.body; // array de roomIds
        const updatedClass = await ClassService.setRooms(id, rooms);
        return ApiResponse.OK(res, "Salas da turma atualizadas com sucesso.", updatedClass);
    }),

    addRoom: controllerWrapper(async (req, res) => {
        const { id, roomId } = req.params;
        const updatedClass = await ClassService.addRoom(id, roomId);
        return ApiResponse.OK(res, "Sala adicionada à turma com sucesso.", updatedClass);
    }),

    removeRoom: controllerWrapper(async (req, res) => {
        const { id, roomId } = req.params;
        const updatedClass = await ClassService.removeRoom(id, roomId);
        return ApiResponse.OK(res, "Sala removida da turma com sucesso.", updatedClass);
    }),

    /* ==========================
       ALUNOS
    ========================== */

    getStudents: controllerWrapper(async (req, res) => {
        const id = req.params.id;

        // Busca a turma primeiro
        const classData = await ClassService.getById(id);

        // Usa o code corretamente
        const students = await StudentService.getByClassId(classData._id);

        return ApiResponse.OK(res, "", students);
    }),
};

export default classController;
