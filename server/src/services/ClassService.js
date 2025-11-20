import BaseService from "./BaseService.js";
import Class from "../models/classModel.js";
import {
    ConflictError,
    ValidationError,
    NotFoundError,
} from "../errors/appError.js";

class ClassService extends BaseService {
    constructor() {
        super(Class);
    }

    /**
     * Cria uma nova turma com validações de código duplicado.
     * @param {Object} data - Dados da turma
     */
    async create(data) {
        if (!data.code)
            throw new ValidationError("O código da turma (code) é obrigatório.");

        const existing = await this.model.findOne({ code: data.code });
        if (existing)
            throw new ConflictError("Já existe uma turma com este código.");

        return super.create(data);
    }

    /**
     * Busca turma pelo código (ex: 'I2P4')
     * @param {string} code - Código da turma
     */
    async getByCode(code) {
        const classData = await this.model.findOne({ code }).populate("teachers", "name role isActive");
        if (!classData)
            throw new NotFoundError("Turma não encontrada.");
        return classData;
    }

    /**
     * Atualiza dados da turma.
     * @param {string} id - ID da turma
     * @param {Object} updateData - Dados para atualização
     */
    async updateClass(id, updateData) {
        if (updateData.code) {
            const conflict = await this.model.findOne({
                code: updateData.code,
                _id: { $ne: id },
            });
            if (conflict)
                throw new ConflictError("Já existe uma turma com esse código.");
        }

        return super.update(id, updateData);
    }

    /**
     * Lista todas as turmas com professores populados
     */
    async getAll() {
        return this.model.find().populate("teachers", "name role isActive");
    }

    /**
     * Define os professores de uma turma (substitui o array inteiro)
     */
    async setTeachers(classId, teacherIds) {
        const classData = await this.model.findById(classId);
        if (!classData) throw new NotFoundError("Turma não encontrada.");

        classData.teachers = teacherIds;
        await classData.save();

        return classData.populate("teachers", "name role isActive");
    }

    /**
     * Adiciona um professor à turma
     */
    async addTeacher(classId, teacherId) {
        const classData = await this.model.findById(classId);
        if (!classData) throw new NotFoundError("Turma não encontrada.");

        if (!classData.teachers.includes(teacherId)) {
            classData.teachers.push(teacherId);
            await classData.save();
        }

        return classData.populate("teachers", "name role isActive");
    }

    /**
     * Remove um professor da turma
     */
    async removeTeacher(classId, teacherId) {
        const classData = await this.model.findById(classId);
        if (!classData) throw new NotFoundError("Turma não encontrada.");

        classData.teachers = classData.teachers.filter(
            (id) => id.toString() !== teacherId.toString()
        );

        await classData.save();
        return classData.populate("teachers", "name role isActive");
    }

    async getTeachers(id) {
        if (!id) throw new ValidationError("Código da turma é obrigatório");
        try {
            const classData = await this.model.findOne({ _id: id }).populate("teachers", "name role isActive");
            if (!classData) throw new NotFoundError("Essa turma não possui professores.");
            return classData;
        } catch (err) {
            if (err.name === "CastError") throw new ValidationError("ID inválido");
            else throw err;
        }
    }
}

export default new ClassService();
