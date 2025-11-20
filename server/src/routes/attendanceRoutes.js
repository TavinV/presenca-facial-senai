import { Router } from "express";
import attendanceController from "../controllers/attendanceController.js";
import { attendanceSchemas } from "../validations/attendanceValidation.js";
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import facialApiAuth from "../middlewares/facialApiAuth.js";

const router = Router();

// 🔹 Criar registro de presença
router.post(
    "/manual",
    authenticateJWT(),
    validateRequest(attendanceSchemas.create),
    attendanceController.markManual
);

router.post(
    "/facial",
    facialApiAuth,
    attendanceController.markByFace
)

// 🔹 Atualizar registro
router.patch(
    "/:id",
    authenticateJWT(),
    validateRequest(attendanceSchemas.update),
    attendanceController.update
);

// 🔹 Deletar registro
router.delete(
    "/:id",
    authenticateJWT(),
    attendanceController.delete
);

export default router;
