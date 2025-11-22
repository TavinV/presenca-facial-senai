import BaseService from "./BaseService.js";
import Student from "../models/studentModel.js";
import Class from "../models/classModel.js";
import {
    ValidationError,
    NotFoundError,
    ConflictError,
} from "../errors/appError.js";

class StudentService extends BaseService {
    constructor() {
        super(Student);
    }


    

    /**
     * Criar aluno
     */
    async create(data) {
        // Verificar facialId
        if (!data.facialId) {
            throw new ValidationError("O aluno precisa ter um ID de reconhecimento facial (facialId).");
        }

        // Evitar duplicidade do facialId
        const hasFaceConflict = await this.model.findOne({ facialId: data.facialId });
        if (hasFaceConflict) {
            throw new ConflictError("Este facialId já está registrado para outro aluno.");
        }

        // Validar turma pelo código
        const classExists = await Class.findOne({ code: data.classCode });
        if (!classExists) {
            throw new NotFoundError("A turma informada não existe.");
        }

        return super.create(data);
    }

    /**
     * Buscar alunos por código da classe
     */
    async getByClassCode(id) {
        if (!id) throw new ValidationError("O ID da turma é obrigatório.");
        
        const foundClass = await Class.findById(id);
        if (!foundClass) throw new NotFoundError("Turma não encontrada.");

        const classCode = foundClass.code;
        const students = await this.model.find({ classCode: classCode });
        if (!students.length) {
            throw new NotFoundError("Nenhum aluno encontrado para esta turma.");
        }
        return students;
    }

    /**
     * Atualização normal (exceto facialId)
     */
    async update(id, data) {
        // Validar turma se for alterada
        if (data.classCode) {
            const classExists = await Class.findOne({ code: data.classCode });
            if (!classExists) {
                throw new NotFoundError("A turma informada não existe.");
            }
        }

        // Impedir update de facialId por aqui
        if (data.facialId) {
            throw new ValidationError(
                "Use a rota correta para atualizar reconhecimento facial (PATCH /students/:id/facial)."
            );
        }

        return super.update(id, data);
    }

    /**
     * Atualizar apenas o facialId
     */
    async updateFaceData(id, newFacialId) {
        if (!newFacialId) {
            throw new ValidationError("O novo facialId é obrigatório.");
        }

        const conflict = await this.model.findOne({ facialId: newFacialId });
        if (conflict && conflict._id.toString() !== id.toString()) {
            throw new ConflictError("Este facialId já está vinculado a outro aluno.");
        }

        return super.update(id, { facialId: newFacialId });
    }
}

export default new StudentService();
