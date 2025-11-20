import express from "express";
import studentController from "../controllers/studentController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { studentSchemas } from "../validations/studentValidation.js";

import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateJWT(), validateRequest(studentSchemas.create), studentController.create);

router.get("/", authenticateJWT(), studentController.getAll);

router.get("/:id", authenticateJWT(), studentController.getById);
router.get("/class/:classCode", authenticateJWT(), studentController.getByClassCode);

router.patch("/:id", authenticateJWT(), validateRequest(studentSchemas.update),studentController.update);
router.patch("/:id/face", authenticateJWT(), validateRequest(studentSchemas.updateFacial),studentController.updateFace);

router.delete("/:id", authenticateJWT(), studentController.delete);

export default router;
