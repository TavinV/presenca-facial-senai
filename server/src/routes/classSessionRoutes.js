import express from "express";
import classSessionController from "../controllers/classSessionController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { classSessionSchemas } from "../validations/classSessionValidation.js";

const router = express.Router();

/**
 * Criar sessão de aula
 * Professor ou coordenador (teacherId vem do JWT)
 */
router.post(
    "/",
    authenticateJWT(),
    // validateRequest(classSessionSchemas.create),
    classSessionController.create
);

/**
 * Buscar todas as sessões de uma turma
 */
router.get(
    "/class/:classId",
    authenticateJWT(),
    classSessionController.getByClass
);

/**
 * Buscar todas as sessões de um professor
 */
router.get(
    "/teacher/:teacherId",
    authenticateJWT(),
    classSessionController.getByTeacher
);

/**
 * Buscar sessão por ID
 */
router.get(
    "/:id",
    authenticateJWT(),
    classSessionController.getById
);

/**
 * Atualizar dados básicos da sessão
 */
router.patch(
    "/:id",
    authenticateJWT(),
    validateRequest(classSessionSchemas.update),
    classSessionController.update
);

/**
 * Fechar sessão
 */
router.patch(
    "/:id/close",
    authenticateJWT(),
    classSessionController.closeSession
);

/**
 * Deletar sessão por completo
 */
router.delete(
    "/:id",
    authenticateJWT(),
    classSessionController.delete
);

export default router;
