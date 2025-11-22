import BaseService from "./BaseService.js";
import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import ClassSession from "../models/classSessionModel.js";
import { NotFoundError, ConflictError, ValidationError } from "../errors/appError.js";

class AttendanceService extends BaseService {
    constructor() {
        super(Attendance);
    }

    // --- REGISTRO FACIAL / MANUAL ---

    async markPresenceByFace(facialId, sessionId) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");
        if (session.status === "closed") throw new ConflictError("Sessão fechada.");

        const student = await Student.findOne({ facialId });
        if (!student) throw new NotFoundError("Aluno não encontrado.");

        const already = await Attendance.findOne({ sessionId, student: student._id });
        if (already) throw new ConflictError("Aluno já registrado.");

        return Attendance.create({
            sessionId,
            student: student._id,
            classCode: student.classCode,
            status: "presente",
            checkInTime: new Date(),
            method: "facial",
            viaFacial: true
        });
    }

    async markPresenceManual({ sessionId, studentId, status, recordedBy }) {
        if (!["presente", "atrasado", "ausente"].includes(status))
            throw new ValidationError("Status inválido.");
        console.log(sessionId, studentId, status, recordedBy, "from service");
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");
        if (session.status === "closed") throw new ConflictError("Sessão fechada.");

        const student = await Student.findById(studentId);
        if (!student) throw new NotFoundError("Aluno não encontrado.");

        const already = await Attendance.findOne({ sessionId, student: studentId });
        if (already) throw new ConflictError("Aluno já registrado.");

        return Attendance.create({
            sessionId,
            student: studentId,
            classCode: student.classCode,
            status,
            checkInTime: status !== "ausente" ? new Date() : null,
            recordedBy,
            method: "manual",
            viaFacial: false
        });
    }

    // --- CONSULTAS NOVAS ---

    async getTodayByClass(classCode) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        return Attendance.find({
            classCode,
            date: { $gte: start, $lte: end }
        });
    }

    async getRangeByClass(classCode, start, end) {
        return Attendance.find({
            classCode,
            date: { $gte: new Date(start), $lte: new Date(end) }
        });
    }

    // --- RELATÓRIO COMPLETO ---

    async getFullReportBySession(sessionId) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");

        const students = await Student.find({ classCode: session.classCode });
        const attendances = await Attendance.find({ sessionId });

        const presentIds = attendances.map(a => a.student.toString());

        const absentees = students.filter(
            s => !presentIds.includes(s._id.toString())
        );

        return {
            session,
            presentes: attendances,
            ausentes: absentees
        };
    }

    // --- AUSÊNCIAS AUTOMÁTICAS ---

    async markAbsencesForSession(sessionId) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");

        const students = await Student.find({ classCode: session.classCode });
        const existing = await Attendance.find({ sessionId });

        const registered = new Set(existing.map(a => a.student.toString()));

        const toCreate = students
            .filter(s => !registered.has(s._id.toString()))
            .map(s => ({
                sessionId,
                student: s._id,
                classCode: s.classCode,
                status: "ausente",
                date: new Date(),
                method: "manual",
                viaFacial: false
            }));

        if (toCreate.length) await Attendance.insertMany(toCreate);

        return { created: toCreate.length };
    }
}

export default new AttendanceService();
