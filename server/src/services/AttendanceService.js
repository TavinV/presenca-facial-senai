import BaseService from "./BaseService.js";
import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import ClassSession from "../models/classSessionModel.js";
import ClassService from "./ClassService.js";
import PreAttendanceService from "./PreAttendanceService.js";
import { NotFoundError, ConflictError, ValidationError } from "../errors/appError.js";

class AttendanceService extends BaseService {
    constructor() {
        super(Attendance);
    }

    /**
     * =========================================================
     * REGISTRO POR RECONHECIMENTO FACIAL (Totem)
     * =========================================================
     */
    async markPresenceByFace({ userId, roomId }) {
        const student = await Student.findOne({ _id: userId });
        if (!student) throw new NotFoundError("Aluno não encontrado.");

        // Busca sessão ABERTA para essa sala
        const session = await ClassSession.findOne({
            room: roomId,
            status: "open"
        });

        // 👉 NÃO há sessão aberta → PRE-ATTENDANCE
        if (!session) {
            await PreAttendanceService.create({
                roomId,
                studentId: student._id
            });

            return {
                type: "pre_attendance",
                message: "Sessão não aberta. Presença armazenada temporariamente."
            };
        }

        // Sessão aberta → Attendance real
        // Transformando array de classCodes em array de classIDs
        let studentClassIds = [];
        for (const classCode of student.classes) {
            const foundClass = await ClassService.getByCode(classCode);
            if (foundClass ) {
                studentClassIds.push(foundClass._id.toString());
            }}
            console.log("Student class IDs:", studentClassIds);
            console.log("Session class ID:", session.class.toString());
            if (!studentClassIds.includes(session.class.toString())) {
            throw new ConflictError("Aluno não pertence à turma desta sessão.");
        }

        const alreadyExists = await Attendance.findOne({
            session: session._id,
            student: student._id,
        });


        if (alreadyExists)
            throw new ConflictError("Presença já registrada.");

        return Attendance.create({
            session: session._id,
            class: session.class,
            student: student._id,
            status: "presente",
            checkInTime: new Date(),
            recordedBy: null,
        });
    }

    /**
     * =========================================================
     * REGISTRO MANUAL (Professor / Coordenador)
     * =========================================================
     */
    async markPresenceManual({
        sessionId,
        studentId,
        status,
        recordedBy,
    }) {
        if (!["presente", "atrasado", "ausente"].includes(status)) {
            throw new ValidationError("Status inválido.");
        }

        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");
        if (session.status === "closed")
            throw new ConflictError("Sessão fechada.");

        const student = await Student.findById(studentId);
        if (!student) throw new NotFoundError("Aluno não encontrado.");
        
        const classData = await ClassService.getById(session.class);
        if (!student.classes.includes(classData.code.toString().toUpperCase())) {
            throw new ConflictError("Aluno não pertence à turma desta sessão.");
        }

        const alreadyExists = await Attendance.findOne({
            session: session._id,
            student: student._id,
        });

        if (alreadyExists)
            throw new ConflictError("Presença já registrada para este aluno.");

        return Attendance.create({
            session: session._id,
            class: session.class,
            student: student._id,
            status,
            checkInTime: status !== "ausente" ? new Date() : null,
            recordedBy,
        });
    }

    /**
     * =========================================================
     * CONSULTAS
     * =========================================================
     */

    async getBySession(sessionId) {
        return Attendance.find({ session: sessionId })
            .populate("student", "name registration")
            .populate("recordedBy", "name role");
    }

    async getByClass(classId) {
        return Attendance.find({ class: classId })
            .populate("student", "name registration")
            .populate("session", "date status");
    }

    /**
     * =========================================================
     * RELATÓRIO COMPLETO DA SESSÃO
     * =========================================================
     */
    async getFullReportBySession(sessionId) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");

        const students = await Student.find({
            classes: session.class,
        });

        const attendances = await Attendance.find({
            session: session._id,
        });

        const presentIds = new Set(
            attendances.map(a => a.student.toString())
        );

        const absentees = students.filter(
            s => !presentIds.has(s._id.toString())
        );

        return {
            session,
            presentes: attendances,
            ausentes: absentees,
        };
    }

    /**
     * =========================================================
     * CONSOME PRE ATTENDANCES
     * =========================================================
     */
    async consumePreAttendances(sessionId) {
        const session = await ClassSession.findById(sessionId);
        if (!session) throw new NotFoundError("Sessão não encontrada.");
        console.log("Consuming pre-attendances for session:", sessionId);

        const preAttendances = await PreAttendanceService.getByRoom(session.room.toString());

        console.log(`Found ${preAttendances.length} pre-attendances for room ${session.room.toString()}`);


        if (!preAttendances.length) return { created: 0 };

        let created = 0;

        for (const pre of preAttendances) {
            const student = await Student.findById(pre.studentId);
            if (!student) continue;
            console.log("Processing pre-attendance for student:", student._id.toString());

            // valida vínculo com a turma

            // Transformando array de classCodes em array de classIDs
            let studentClassIds = [];
            for (const classCode of student.classes) {
                const foundClass = await ClassService.getByCode(classCode);
                if (foundClass) {
                    studentClassIds.push(foundClass._id.toString());
                }
            }

            if (!studentClassIds.includes(session.class.toString())) continue;
            console.log("Student belongs to class:", session.class.toString());
            const exists = await Attendance.findOne({
                session: session._id,
                student: student._id
            });

            if (exists) continue;
            console.log("Creating attendance record for student:", student._id.toString());
            await Attendance.create({
                session: session._id,
                class: session.class,
                student: student._id,
                status: "presente",
                checkInTime: new Date(pre.timestamp),
                recordedBy: null
            });

            created++;
        }

        // limpa os pré-attendances da sala
        await PreAttendanceService.clearRoom(session.room.toString());

        return { created };
    }

}

export default new AttendanceService();
