import express from "express";
import classController from "../controllers/classController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { classSchemas } from "../validations/classValidation.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * =========================
 * TURMAS
 * =========================
 */

// Criar turma
router.post(
    "/",
    authenticateJWT("coordenador"),
    validateRequest(classSchemas.create),
    classController.create
);

// Listar todas as turmas
router.get(
    "/",
    authenticateJWT("coordenador"),
    classController.getAll
);

// Buscar turma pelo código (ex: I2P4)
router.get(
    "/name/:name",
    authenticateJWT(),
    classController.getByName
);

// Buscar as turmas que um professor leciona (JWT)
router.get(
    "/my",
    authenticateJWT(),
    classController.getClassesByTeacher
);

// Buscar turma por ID
router.get(
    "/:id",
    authenticateJWT(),
    classController.getById
);

// Atualizar turma
router.patch(
    "/:id",
    authenticateJWT("coordenador"),
    validateRequest(classSchemas.update),
    classController.update
);

// Deletar turma
router.delete(
    "/:id",
    authenticateJWT("coordenador"),
    classController.delete
);

/**
 * =========================
 * PROFESSORES DA TURMA
 * =========================
 */

// Listar professores da turma
router.get(
    "/:id/teachers",
    authenticateJWT(),
    classController.getTeachers
);

// Adicionar professor à turma
router.post(
    "/:id/teachers/:teacherId",
    authenticateJWT("coordenador"),
    classController.addTeacher
);

// Remover professor da turma
router.delete(
    "/:id/teachers/:teacherId",
    authenticateJWT("coordenador"),
    classController.removeTeacher
);

/**
 * =========================
 * SALAS (ROOMS) DA TURMA
 * =========================
 */

// Listar salas associadas à turma
router.get(
    "/:id/rooms",
    authenticateJWT(),
    classController.getRooms
);

// Associar sala à turma
router.post(
    "/:id/rooms/:roomId",
    authenticateJWT("coordenador"),
    classController.addRoom
);

// Remover sala da turma
router.delete(
    "/:id/rooms/:roomId",
    authenticateJWT("coordenador"),
    classController.removeRoom
);

/**
 * =========================
 * ALUNOS DA TURMA
 * =========================
 */

// Listar alunos da turma
router.get(
    "/:id/students",
    authenticateJWT(),
    classController.getStudents
);

// Adicionar aluno à turma
router.post(
    "/:id/students/:studentId",
    authenticateJWT(),
    classController.addStudent
);

// Remover aluno da turma
router.delete(
    "/:id/students/:studentId",
    authenticateJWT(),
    classController.removeStudent
);

/**
 * =========================
 * SUBJECTS (MATÉRIAS)
 * =========================
 */

// Listar matérias da turma
router.get(
    "/:id/subjects",
    authenticateJWT(),
    classController.getSubjects
);

// Adicionar matéria à turma
router.post(
    "/:id/subjects",
    authenticateJWT("coordenador"),
    classController.addSubject
);

// Atualizar matéria da turma (ex: nome)
router.patch(
    "/:id/subjects/:subjectCode",
    authenticateJWT("coordenador"),
    classController.updateSubject
);

// Remover matéria da turma
router.delete(
    "/:id/subjects/:subjectCode",
    authenticateJWT("coordenador"),
    classController.removeSubject
);


export default router;
