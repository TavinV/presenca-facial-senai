import BaseService from "./BaseService.js";
import ClassSession from "../models/classSessionModel.js";
import ClassService from "./ClassService.js";
import AttendanceService from "./AttendanceService.js";
import { NotFoundError, ValidationError } from "../errors/appError.js";

class ClassSessionService extends BaseService {
    constructor() {
        super(ClassSession);
    }

    /**
     * Cria uma nova sessão de aula
     * - Usa classId
     * - Usa teacherId vindo do JWT
     * - Sessão nasce aberta
     */
    async create({ classId, name, date, teacherId, room }) {
        if (!classId) {
            throw new ValidationError("O ID da turma é obrigatório.");
        }

        const classExists = await ClassService.getById(classId);
        if (!classExists) {
            throw new NotFoundError("Turma não encontrada.");
        }

        const classSessionExists = await this.model.findOne({
            class: classId,
            date,
            room,
        });

        if (classSessionExists) {
            throw new ValidationError("Já existe uma aula para esta turma, data e sala.");
        }

        const session = await super.create({
            class: classId,
            name,
            date,
            teacher: teacherId,
            room,
            status: "open",
        });

        await AttendanceService.consumePreAttendances(session._id);
        return session;
    }

    /**
     * Busca sessão por ID
     */
    async getById(id) {
        const session = await this.model
            .findById(id)
            .populate("class", "code course shift year")
            .populate("teacher", "name email")
            .populate("room", "name location");

        if (!session) {
            throw new NotFoundError("Sessão de aula não encontrada.");
        }

        return session;
    }

    /**
     * Lista sessões de uma turma
     */
    async getByClass(classId) {
        return this.model
            .find({ class: classId })
            .populate("teacher", "name")
            .populate("room", "name location")
            .sort({ date: -1 });
    }

    /**
     * Lista sessões de um professor
     */
    async getByTeacher(teacherId) {
        return this.model
            .find({ teacher: teacherId })
            .populate("classId", "code")
            .populate("room", "name")
            .sort({ date: -1 });
    }

    /**
     * Busca sessão aberta por sala e data
     * (usado pelo AttendanceService / Totem)
     */
    async getOpenSessionByRoom(roomId, date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const session = await this.model.findOne({
            room: roomId,
            status: "open",
            date: { $gte: start, $lte: end },
        });

        if (!session) {
            throw new NotFoundError("Nenhuma sessão aberta encontrada para esta sala.");
        }

        return session;
    }

    /**
     * Atualiza dados básicos da sessão
     */
    async updateSession(sessionId, updateData) {
        return super.update(sessionId, updateData);
    }

    /**
     * Fecha a sessão
     */
    async closeSession(sessionId) {
        const session = await this.model.findById(sessionId);
        if (!session) {
            throw new NotFoundError("Sessão não encontrada.");
        }

        session.status = "closed";
        await session.save();

        return session;
    }

    /**
     * Remove a sessão
     */
    async deleteSession(sessionId) {
        return super.delete(sessionId);
    }
}

export default new ClassSessionService();
