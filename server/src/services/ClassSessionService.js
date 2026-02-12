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
    async create({ classId, subjectCode, name, teacherId, room, endsAt, byCoordinator = false }) {
        if (!classId) {
            throw new ValidationError("O ID da turma é obrigatório.");
        }

        if (!endsAt) {
            throw new BadRequestError("Sessão deve possuir endsAt definido.");
        }

        const classExists = await ClassService.getById(classId);
        if (!classExists) {
            throw new NotFoundError("Turma não encontrada.");
        }

        if (!classExists.teachers.includes(teacherId) && !byCoordinator) {
            throw new ValidationError(
                "O professor não está vinculado a esta turma."
            );
        }

        if (!classExists.subjects || classExists.subjects.length === 0) {
            throw new ValidationError(
                "Esta turma não possui matérias cadastradas."
            );
        }

        const subject = classExists.subjects.find(
            (s) => s.code === subjectCode
        );

        if (!subject) {
            throw new ValidationError(
                "A matéria informada não pertence a esta turma."
            );
        }

        const now = new Date();

        const conflict = await this.model.findOne({
            room,
            status: "active",
            endsAt: { $gt: now }
        });

        if (conflict) {
            throw new ValidationError(
                "Já existe uma aula aberta nesta sala."
            );
        }

        const session = await super.create({
            class: classId,
            name,
            date: now,
            teacher: teacherId,
            room,
            endsAt,
            startedAt: now,
            status: "active",
            subjectCode,
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
            .populate("class", "code")
            .populate("room", "name")
            .sort({ date: -1 });
    }

    /**
     * Busca sessão aberta por sala e data
     * (usado pelo AttendanceService / Totem)
     */
    async getOpenSessionByRoom(roomId, date) {
        const now = new Date()

        const session = await this.model.findOne({
            room: roomId,
            status: "active",
            endsAt: { $gt : now}
        });

        if (session && now >= session.endsAt) {
            session.status = "closed";
            session.closedAt = now;
            await session.save();

            throw new NotFoundError("Sessão encerrada automaticamente.");
        }

        if (!session) {
            throw new NotFoundError("Nenhuma sessão aberta encontrada para esta sala.");
        }

        return session;
    }


    /*
    * Fecha automaticamente aulas abertas que já acabaram, usando roomId
    */
    async closeExpiredSessions(roomId) {
        const now = new Date();

        await this.model.updateMany(
            {
                room: roomId,
                status: "active",
                endsAt: { $lte: now }
            },
            {
                status: "closed",
                closedAt: now
            }
        );
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

        if (session.status !== "active") {
            throw new ValidationError("A sessão já está encerrada.");
        }

        session.status = "closed";
        session.closedAt = new Date()
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
