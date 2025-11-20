import controllerWrapper from "../utils/controllerWrapper.js";
import ApiResponse from "../utils/ApiResponse.js";
import StudentService from "../services/StudentService.js";

class StudentController {
    create = controllerWrapper(async (req, res) => {
        const student = await StudentService.create(req.body);
        return ApiResponse.CREATED(res, "Aluno criado com sucesso.", student);
    });

    getAll = controllerWrapper(async (req, res) => {
        const students = await StudentService.getAll();
        return ApiResponse.OK(res, "", students);
    });

    getById = controllerWrapper(async (req, res) => {
        const student = await StudentService.getById(req.params.id);
        return ApiResponse.OK(res, "", student);
    });

    getByClassCode = controllerWrapper(async (req, res) => {
        const { classCode } = req.params;
        const students = await StudentService.getByClassCode(classCode);
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
        const { facialId } = req.body;

        const updated = await StudentService.updateFaceData(id, facialId);
        return ApiResponse.OK(res, "Identificação facial atualizada com sucesso.", updated);
    });
}

export default new StudentController();
