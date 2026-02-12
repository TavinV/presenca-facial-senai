import BaseService from "./BaseService.js";
import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import ClassSession from "../models/classSessionModel.js";
import ClassService from "./ClassService.js";
import ClassSessionService from "./ClassSessionService.js";
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
        const now = new Date();
        
        // Busca sessão ABERTA para essa sala
        ClassSessionService.closeExpiredSessions(roomId);
    
        const session = await ClassSession.findOne({
            room: roomId,
            status: "active",
            endsAt: { $gt: now }
        }).sort({ endsAt: 1 }); 

        let studentClassIds = [];
        for (const classCode of student.classes) {
            const foundClass = await ClassService.getByCode(classCode);
            if (foundClass ) {
                studentClassIds.push(foundClass._id.toString());
            }
        }


        // 👉 NÃO há sessão aberta → PRE-ATTENDANCE
        if (!session || ( session && !studentClassIds.includes(session.class.toString()))) {
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
        const now = new Date();
        
        if (!session) throw new NotFoundError("Aula não encontrada.");
        
        if (session.endsAt <= now) {
            ClassSessionService.closeSession(sessionId);
            throw new ConflictError("Essa aula já acabou.")
        }

        if (session.status === "closed") throw new ConflictError("Esta aula está encerrada.");

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

        const classData = await ClassService.getById(session.class);
        if (!classData) throw new NotFoundError("Turma não encontrada.");

        // Alunos da turma
        const students = await Student.find(
            { classes: classData.code.toString().toUpperCase() },
            { name: 1, registration: 1 } // 👈 projection
        );

        // Presenças da sessão
        const attendances = await Attendance.find(
            { session: session._id }
        ).populate("student", "name registration");


        let presentes = attendances
        .filter(att => att.status === "presente" && att.student)
        .map(att => ({
            nome: att.student?.name ?? "[Aluno removido]",
            matricula: att.student?.registration ?? null,
            horario: att.createdAt,
            id: att.student?._id ?? null
        }));

        const atrasados = attendances.filter(att => att.status === "atrasado").map(att => ({
            nome: att.student?.name ?? "[Aluno remobido]",
            matricula: att.student?.registration ?? null,
            horario: att.createdAt,
            id: att.student?._id ?? null
        }));


        // IDs dos alunos presentes (somente se student existir)
        const presentStudentIds = new Set(
            attendances
                .filter(att => att.student) 
                .map(att => att.student._id.toString())
        );

        const lateStudentIds = new Set(
            attendances
                .filter(att => att.status === "atrasado" && att.student)
                .map(att => att.student._id.toString())
        );


        // AUSENTES (alunos sem presença)
        const ausentes = students
            .filter(student => !presentStudentIds.has(student._id.toString()) && !lateStudentIds.has(student._id.toString()))
            .map(student => ({
                nome: student.name || '[Aluno removido]',
                matricula: student.registration || null,
                id: student._id
            }));

        return {
            session: {
                _id: session._id,
                name: session.name,
                date: session.date,
                status: session.status,
            },
            presentes,
            ausentes,
            atrasados,
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
        
        const now = new Date();

        if (session.status !== "active" || session.endsAt <= now) {
            throw new ConflictError("Sessão encerrada.");
        }

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
            const classData = await ClassService.getById(session.class);

            if (!student.classes.includes(classData.code.toString())) continue;
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

    async getStudentSubjectAttendance({
        classId,
        studentId,
        subjectCode
    }) {
        if (!classId || !studentId || !subjectCode) {
            throw new ValidationError(
                "classId, studentId e subjectCode são obrigatórios."
            );
        }
        //  sessões da matéria
        const sessions = await ClassSession.find({
            class: classId,
            subjectCode,
            status: "closed"
        }).select("_id");

        const sessionIds = sessions.map(s => s._id);
        const totalSessions = sessions.length;

        if (totalSessions === 0) {
            return {
                totalClasses: 0,
                presences: 0,
                absences: 0,
                frequency: 0
            };
        }

        if (sessionIds.length === 0) {
            return {
                totalClasses: 0,
                presences: 0,
                absences: 0,
                frequency: 0
            };
        }

        // contar presenças APENAS dessas sessões
        const presences = await Attendance.countDocuments({
            class: classId,
            student: studentId,
            status: { $in: ["presente", "atrasado"] },
            session: { $in: sessionIds }
        });


        const absences = totalSessions - presences;
        
        const frequency = Number(
            ((presences / totalSessions) * 100).toFixed(2)
        );

        const student = await Student.findById(studentId, "name registration");

        return {
            student: {
                _id: studentId,
                name: student?.name ?? "[Aluno removido]",
                registration: student?.registration ?? null 
            },
            subject: subjectCode,
            totalClasses: totalSessions,
            presences,
            absences,
            frequency
        };
    }

    async getClassAttendanceTableBySubject({ classId, subjectCode }) {
        if (!classId || !subjectCode) {
            throw new ValidationError("classId e subjectCode são obrigatórios.");
        }

        // 1️⃣ Sessões encerradas da matéria
        const sessions = await ClassSession.find({
            class: classId,
            subjectCode,
            status: "closed",
        }).select("_id");

        const totalAulas = sessions.length;

        if (totalAulas === 0) {
            return {
                subjectCode,
                totalAulas: 0,
                alunos: []
            };
        }

        const sessionIds = sessions.map(s => s._id);

        // 2️⃣ Código da turma
        const classData = await ClassService.getById(classId);

        // 3️⃣ Alunos ATUAIS da turma
        const students = await Student.find({
            classes: classData.code
        }).select("name registration");

        // 4️⃣ Presenças da matéria
        const attendances = await Attendance.find({
            class: classId,
            session: { $in: sessionIds },
        }).populate("student", "name registration");

        /**
         * attendanceMap:
         * {
         *   studentId: {
         *     presente,
         *     atrasado,
         *     nome,
         *     matricula
         *   }
         * }
         */
        const attendanceMap = {};

        for (const att of attendances) {
            const studentId = att.student?._id?.toString() ?? att.student?.toString();

            if (!studentId) continue; // segurança extra

            if (!attendanceMap[studentId]) {
                attendanceMap[studentId] = {
                    presente: 0,
                    atrasado: 0,
                    nome: att.student?.name ?? "[Aluno removido]",
                    matricula: att.student?.registration ?? null
                };
            }

            if (att.status === "presente") {
                attendanceMap[studentId].presente++;
            }

            if (att.status === "atrasado") {
                attendanceMap[studentId].atrasado++;
            }
        }

        // 5️⃣ Tabela final (alunos existentes)
        const table = students.map(student => {
            const stats = attendanceMap[student._id.toString()] || {
                presente: 0,
                atrasado: 0
            };

            const totalCompareceu = stats.presente + stats.atrasado;
            const faltas = totalAulas - totalCompareceu;
            const frequencia = Number(
                ((totalCompareceu / totalAulas) * 100).toFixed(2)
            );

            return {
                aluno: student.name,
                matricula: student.registration,
                faltas,
                atrasos: stats.atrasado,
                frequencia
            };
        });

        // 6️⃣ Alunos removidos (existem no Attendance mas não no Student)
        const removedStudents = Object.entries(attendanceMap)
            .filter(([studentId]) => !students.some(s => s._id.toString() === studentId))
            .map(([_, stats]) => {
                const totalCompareceu = stats.presente + stats.atrasado;
                const faltas = totalAulas - totalCompareceu;
                const frequencia = Number(
                    ((totalCompareceu / totalAulas) * 100).toFixed(2)
                );

                return {
                    aluno: stats.nome,
                    matricula: stats.matricula,
                    faltas,
                    atrasos: stats.atrasado,
                    frequencia
                };
            });

        return {
            subjectCode,
            totalAulas,
            alunos: [...table, ...removedStudents]
        };
    }


}

export default new AttendanceService();
