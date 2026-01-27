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
     * Cria uma nova turma com validação de código duplicado
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
     * Busca turma pelo código (ex: I2P4)
     */
    async getByCode(code) {
        if (!code)
            throw new ValidationError("O código da turma é obrigatório.");

        const classData = await this.model
            .findOne({ code })
            .populate("teachers", "name role isActive")
            .populate("rooms", "name location isActive");

        if (!classData)
            throw new NotFoundError("Turma não encontrada.");

        return classData;
    }

    /**
     * Atualiza dados da turma
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
     * Lista todas as turmas com professores e salas
     */
    async getAll() {
        return this.model
            .find()
            .populate("teachers", "name role isActive")
            .populate("rooms", "name location isActive");
    }

    /* ==========================
       PROFESSORES
    ========================== */

    async getClassesByTeacher(teacherId) {
        return this.model
            .find({ teachers: teacherId })
            .populate("teachers", "name role isActive")
            .populate("rooms", "name location isActive");
    }

    async setTeachers(classId, teacherIds) {
        const classData = await this.model.findById(classId);
        if (!classData)
            throw new NotFoundError("Turma não encontrada.");

        classData.teachers = teacherIds;
        await classData.save();

        return classData.populate("teachers", "name role isActive");
    }

    async addTeacher(classId, teacherId) {
        const classData = await this.model.findById(classId);
        if (!classData)
            throw new NotFoundError("Turma não encontrada.");

        if (!classData.teachers.includes(teacherId)) {
            classData.teachers.push(teacherId);
            await classData.save();
        }

        return classData.populate("teachers", "name role isActive");
    }

    async removeTeacher(classId, teacherId) {
        const classData = await this.model.findById(classId);
        if (!classData)
            throw new NotFoundError("Turma não encontrada.");

        classData.teachers = classData.teachers.filter(
            (id) => id.toString() !== teacherId.toString()
        );

        await classData.save();
        return classData.populate("teachers", "name role isActive");
    }

    /* ==========================
       SALAS (ROOMS)
    ========================== */

    async setRooms(classId, roomIds) {
        const classData = await this.model.findById(classId);
        if (!classData)
            throw new NotFoundError("Turma não encontrada.");

        classData.rooms = roomIds;
        await classData.save();

        return classData.populate("rooms", "name location isActive");
    }

    async addRoom(classId, roomId) {
        const classData = await this.model.findById(classId);
        if (!classData)
            throw new NotFoundError("Turma não encontrada.");

        if (!classData.rooms.includes(roomId)) {
            classData.rooms.push(roomId);
            await classData.save();
        }

        return classData.populate("rooms", "name location isActive");
    }

    async removeRoom(classId, roomId) {
        const classData = await this.model.findById(classId);
        if (!classData)
            throw new NotFoundError("Turma não encontrada.");

        classData.rooms = classData.rooms.filter(
            (id) => id.toString() !== roomId.toString()
        );

        await classData.save();
        return classData.populate("rooms", "name location isActive");
    }

    /**
     * Retorna professores da turma
     */
    async getTeachers(id) {
        if (!id)
            throw new ValidationError("ID da turma é obrigatório");

        try {
            const classData = await this.model
                .findById(id)
                .populate("teachers", "name role isActive email");

            if (!classData)
                throw new NotFoundError("Turma não encontrada.");

            return classData.teachers;
        } catch (err) {
            if (err.name === "CastError")
                throw new ValidationError("ID inválido");
            throw err;
        }
    }
}

export default new ClassService();
