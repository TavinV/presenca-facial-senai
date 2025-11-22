import { Router } from "express";
import attendanceController from "../controllers/attendanceController.js";
import { attendanceSchemas } from "../validations/attendanceValidation.js";
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import facialApiAuth from "../middlewares/facialApiAuth.js";

const router = Router();

// --- CREATE ---
router.post(
    "/manual",
    authenticateJWT(),
    validateRequest(attendanceSchemas.manual),
    attendanceController.markManual
);

router.post(
    "/facial",
    facialApiAuth,
    validateRequest(attendanceSchemas.markByFace),
    attendanceController.markByFace
);

// --- READ ---
router.get(
    "/session/:sessionId",
    authenticateJWT(),
    attendanceController.getBySession
);

router.get(
    "/student/:studentId",
    authenticateJWT(),
    attendanceController.getByStudent
);

router.get(
    "/class/:classCode/today",
    authenticateJWT(),
    attendanceController.getTodayByClass
);

router.get(
    "/class/:classCode/range",
    authenticateJWT(),
    attendanceController.getRangeByClass
);

router.get(
    "/session/:sessionId/full-report",
    authenticateJWT(),
    attendanceController.getFullReportBySession
);

// --- UPDATE ---
router.patch(
    "/:id",
    authenticateJWT(),
    validateRequest(attendanceSchemas.update),
    attendanceController.update
);

// --- DELETE ---
router.delete(
    "/:id",
    authenticateJWT(),
    attendanceController.delete
);

// --- AUTO ABSENCES ---
router.post(
    "/session/:sessionId/auto-absences",
    authenticateJWT("coordenador"),
    attendanceController.markAbsencesForSession
);

export default router;
