import ApiResponse from "../utils/ApiResponse.js";
import AttendanceService from "../services/AttendanceService.js";
import controllerWrapper from "../utils/controllerWrapper.js";
import ClassSessionService from "../services/ClassSessionService.js";
import ClassService from "../services/ClassService.js";
import PreAttendanceService from "../services/PreAttendanceService.js";

import FormData from "form-data";
import axios from "axios";
import fs from "fs";
import path from "path";
import upload from "../middlewares/multerStorage.js";
import UserService from "../services/UserService.js";
import StudentService from "../services/StudentService.js";
import { ConflictError } from "../errors/appError.js";


const attendanceController = {

    /**
     * =========================================================
     * REGISTRO POR TOTEM (RECONHECIMENTO FACIAL)
     * =========================================================
     */
    markByFace: [
        upload.single('image'),
        controllerWrapper(async (req, res) => {
            const facialApiUrl = process.env.FACIAL_API_URL || "http://localhost:8000";
            const facialApiKey = process.env.FACIAL_API_KEY || "";
            
            const room  = req.totem.room.toString();
            if (!req.file) {
                return ApiResponse.BADREQUEST(res, "Imagem é obrigatória.");
            }

            if (!room) {
                return ApiResponse.BADREQUEST(res, "Room é obrigatório.");
            }

            const imagePath = path.resolve(req.file.path);

            try {
                // Criar FormData
                const formData = new FormData();
                formData.append('room', room);
                formData.append('image', fs.createReadStream(imagePath), {
                    filename: req.file.originalname,
                    contentType: req.file.mimetype
                });

                const candidates = await StudentService.loadStudentsFromRoom(room);
                formData.append('candidates', JSON.stringify(candidates));
                
                // Chamar API facial
                const response = await axios.post(
                    `${facialApiUrl}/recognize`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders(),
                            'x-facial-api-key': facialApiKey
                        },
                        timeout: 30000
                    }
                );

                let {studentId}  = response.data;
                if (!studentId) {
                    return ApiResponse.NOTFOUND(res, "Rosto não reconhecido.");
                }

                const student = await StudentService.getById(studentId);
                if (!student) {return ApiResponse.NOTFOUND(res, "Aluno não cadastrado")}

                // Marcar presença
                const result = await AttendanceService.markPresenceByFace({
                    userId: studentId,
                    roomId: room,
                });

                // Limpar arquivo temporário
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Erro ao deletar imagem temporária:', err);
                });

                // Resposta diferente para pré-attendance
                result.student = student;
                if (result.type === "pre_attendance") {
                    return ApiResponse.OK(
                        res,
                        "A aula ainda não começou. Presença armazenada temporariamente",
                        result
                    );
                }

                return ApiResponse.CREATED(
                    res,
                    "Presença registrada com sucesso.",
                    result
                );

            } catch (error) {
                // Limpar arquivo temporário em caso de erro
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, (err) => {
                        if (err) console.error('Erro ao deletar imagem temporária:', err);
                    });
                }
                
                if (error instanceof ConflictError){
                    return ApiResponse.CONFLICT(res, error.message)
                }

                console.error('❌ Erro ao chamar API facial:', error.message);

                if (error.response) {
                    // Erro da API facial
                    console.error('Status:', error.response.status);
                    console.error('Data:', error.response.data);
                    return ApiResponse.BADREQUEST(
                        res,
                        error.response.data?.detail || "Erro no reconhecimento facial."
                    );
                } else if (error.request) {
                    // Requisição foi feita mas sem resposta
                    console.error('Sem resposta da API facial');
                    return ApiResponse.ERROR(
                        res,
                        "API de reconhecimento facial não está respondendo."
                    );
                } else {
                    // Erro ao configurar requisição
                    console.error('Erro:', error.message);
                    return ApiResponse.ERROR(
                        res,
                        "Erro ao processar reconhecimento facial."
                    );
                }
            }

        })],

    /**
     * =========================================================
     * REGISTRO MANUAL (Professor / Coordenador)
     * =========================================================
     */
    markManual: controllerWrapper(async (req, res) => {
        const { classSessionId, studentId, status } = req.body;

        const session = await ClassSessionService.getById(classSessionId);
        if (!session)
            return ApiResponse.NOTFOUND(res, "Sessão não encontrada.");

        // Se não for coordenador, valida vínculo do professor
        if (req.user.role !== "coordenador") {
            const teachers = await ClassService.getTeachers(session.class);
            const isTeacherFromClass = teachers?.some(
                t => t._id.toString() === req.user.id.toString()
            );

            if (!isTeacherFromClass) {
                return ApiResponse.FORBIDDEN(
                    res,
                    "Você não pode registrar presenças nesta turma."
                );
            }
        }

        const attendance = await AttendanceService.markPresenceManual({
            sessionId: classSessionId,
            studentId,
            status,
            recordedBy: req.user.id,
        });

        return ApiResponse.CREATED(
            res,
            "Presença registrada manualmente.",
            attendance
        );
    }),

    /**
     * =========================================================
     * CONSULTAS
     * =========================================================
     */
    getBySession: controllerWrapper(async (req, res) => {
        const { sessionId } = req.params;
        const records = await AttendanceService.getBySession(sessionId);

        // Also include any pre-attendances stored for the session room
        try {
            const session = await ClassSessionService.getById(sessionId);
            if (session && session.room) {
                const preList = await PreAttendanceService.getByRoom(session.room.toString());

                // enrich pre-attendances with student info and mark as pending
                const enriched = await Promise.all(
                    preList.map(async (p) => {
                        const student = await StudentService.getById(p.studentId);
                        return {
                            // synthetic id so UI can key on it
                            _id: `pre_${p.studentId}_${p.timestamp}`,
                            student,
                            status: "pre_pending",
                            checkInTime: new Date(p.timestamp),
                            recordedBy: null,
                            preAttendance: true,
                        };
                    })
                );

                return ApiResponse.OK(res, "", [...records, ...enriched]);
            }
        } catch (err) {
            console.error('Erro ao incluir pre-attendances:', err.message);
        }

        return ApiResponse.OK(res, "", records);
    }),

    getByStudent: controllerWrapper(async (req, res) => {
        const { studentId } = req.params;
        const records = await AttendanceService.getAll({ student: studentId });
        return ApiResponse.OK(res, "", records);
    }),

    getByClass: controllerWrapper(async (req, res) => {
        const { classId } = req.params;
        const records = await AttendanceService.getByClass(classId);
        return ApiResponse.OK(res, "", records);
    }),

    /**
     * =========================================================
     * RELATÓRIO COMPLETO DA SESSÃO
     * =========================================================
     */
    getFullReportBySession: controllerWrapper(async (req, res) => {
        const { sessionId } = req.params;
        const report = await AttendanceService.getFullReportBySession(sessionId);
        return ApiResponse.OK(res, "", report);
    }),

    /**
     * =========================================================
     * UPDATE / DELETE
     * =========================================================
     */
    update: controllerWrapper(async (req, res) => {
        const updated = await AttendanceService.update(req.params.id, req.body);
        return ApiResponse.OK(res, "Presença atualizada.", updated);
    }),

    delete: controllerWrapper(async (req, res) => {
        await AttendanceService.delete(req.params.id);
        return ApiResponse.NO_CONTENT(res, "Registro removido.");
    }),

    getStudentSubjectAttendance: controllerWrapper(async (req, res) => {
        const { classId, studentId, subjectCode } = req.params;

        const report = await AttendanceService.getStudentSubjectAttendance({
            classId,
            studentId,
            subjectCode
        });

        return ApiResponse.OK(res, "", report);
    }),

    getClassAttendanceTableBySubject: controllerWrapper(async (req, res) => {
        const { classId, subjectCode } = req.params;

        const table = await AttendanceService.getClassAttendanceTableBySubject({
            classId,
            subjectCode
        });

        return ApiResponse.OK(res, "", table);
    }),

};

export default attendanceController;