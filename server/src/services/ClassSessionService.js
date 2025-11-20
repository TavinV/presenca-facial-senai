import BaseService from "./BaseService.js";
import ClassSession from "../models/classSessionModel.js";
import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import { NotFoundError } from "../errors/appError.js";

class ClassSessionService extends BaseService {
    constructor() {
        super(ClassSession);
    }

    /**
     * Cria uma nova sessão de aula para uma turma.
     */
    async createSession({ classCode, teacherId }) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return super.create({
            classCode,
            teacher: teacherId,
            date: today
        });
    }

    /**
     * Marca presença manual do professor dentro da sessão.
     */
    async markAttendanceManually(sessionId, studentId, status, recordedBy) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão de aula não encontrada.");

        const attendance = await Attendance.create({
            student: studentId,
            classCode: session.classCode,
            date: session.date,
            status,
            checkInTime: new Date(),
            recordedBy,
            viaFacial: false
        });

        session.attendances.push(attendance._id);
        await session.save();

        return attendance;
    }

    /**
     * Marca presença automática por reconhecimento facial.
     */
    async markAttendanceByFace(sessionId, facialId) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");

        const student = await Student.findOne({ facialId });
        if (!student) throw new NotFoundError("Aluno não encontrado para o facialId.");

        const alreadyExists = await Attendance.findOne({
            student: student._id,
            date: session.date,
            classCode: session.classCode
        });

        if (alreadyExists) return alreadyExists;

        const attendance = await Attendance.create({
            student: student._id,
            classCode: session.classCode,
            date: session.date,
            status: "presente",
            checkInTime: new Date(),
            viaFacial: true
        });

        session.attendances.push(attendance._id);
        await session.save();

        return attendance;
    }

    /**
     * Fecha a sessão e impede novas presenças.
     */
    async closeSession(sessionId) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");

        session.isOpen = false;
        await session.save();

        return session;
    }

    /**
     * Busca todas as sessões de uma turma em um dia.
     */
    async getSessionsOfDay(classCode) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.model.find({
            classCode,
            date: today
        })
            .populate("teacher", "name")
            .populate("attendances");
    }

    async close(sessionId, userId) {
        const session = await this.model.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");

        session.isClosed = true;
        session.lastEditedBy = userId;
        session.lastEditedAt = new Date();

        return session.save();
    }

    async resetSessionAttendances(sessionId, userId) {
        const session = await this.model.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");

        // Apaga todas as presenças da sessão
        await Attendance.deleteMany({ session: sessionId });

        // Auditoria
        session.lastEditedBy = userId;
        session.lastEditedAt = new Date();
        await session.save();

        return { message: "Presenças resetadas com sucesso." };
    }
}

export default new ClassSessionService();
