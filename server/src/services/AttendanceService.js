import BaseService from "./BaseService.js";
import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import ClassSession from "../models/classSessionModel.js";
import {
    NotFoundError,
    ConflictError,
    ValidationError
} from "../errors/appError.js";

class AttendanceService extends BaseService {
    constructor() {
        super(Attendance);
    }

    /**
     * Marca presença via reconhecimento facial dentro de uma sessão.
     * @param {string} facialId 
     * @param {string} sessionId 
     */
    async markPresenceByFace(facialId, sessionId) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");
        if (session.status === "closed")
            throw new ConflictError("Esta sessão já está fechada.");

        const student = await Student.findOne({ facialId });
        if (!student)
            throw new NotFoundError("Aluno não encontrado para o facialId informado.");

        // Evita duplicidade dentro da mesma sessão
        const alreadyMarked = await this.model.findOne({
            student: student._id,
            sessionId
        });

        if (alreadyMarked)
            throw new ConflictError("A presença deste aluno já foi registrada nesta sessão.");

        return super.create({
            sessionId,
            student: student._id,
            classCode: student.classCode,
            status: "presente",
            checkInTime: new Date(),
            method: "facial",
            viaFacial: true,
        });
    }

    /**
     * Marca presença manualmente.
     * @param {Object} data
     */
    async markPresenceManual({ sessionId, studentId, status, recordedBy }) {
        if (!["presente", "atrasado", "ausente"].includes(status)) {
            throw new ValidationError("Status inválido. Use: presente, atrasado ou ausente.");
        }

        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");
        if (session.status === "closed")
            throw new ConflictError("Esta sessão já está fechada.");

        const student = await Student.findById(studentId);
        if (!student) throw new NotFoundError("Aluno não encontrado.");

        // Evita duplicidade
        const alreadyMarked = await this.model.findOne({
            student: studentId,
            sessionId
        });

        if (alreadyMarked)
            throw new ConflictError("A presença deste aluno já foi registrada nesta sessão.");

        return super.create({
            sessionId,
            student: studentId,
            classCode: student.classCode,
            status,
            checkInTime: status !== "ausente" ? new Date() : null,
            recordedBy,
            viaFacial: false,
            method: "manual",
        });
    }
}

export default new AttendanceService();
