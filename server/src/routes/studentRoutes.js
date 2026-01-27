import express from "express";
import studentController from "../controllers/studentController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { studentSchemas } from "../validations/studentValidation.js";
import facialApiAuth from "../middlewares/facialApiAuth.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateJWT(), validateRequest(studentSchemas.create), studentController.create);
router.post("/:id/classes/:classCode", authenticateJWT(), studentController.addClass);

router.get("/", authenticateJWT(), studentController.getAll);
router.get("/faces", facialApiAuth, studentController.loadAllForFacialAPI);
router.get("/:id", authenticateJWT(), studentController.getById);
router.get("/class/:id", authenticateJWT(), studentController.getByClassId);

router.patch("/:id", authenticateJWT(), validateRequest(studentSchemas.update),studentController.update);
router.patch("/:id/face", authenticateJWT(), validateRequest(studentSchemas.updateFacial),studentController.updateFace);

router.delete("/:id", authenticateJWT(), studentController.delete);
router.delete("/:id/classes/:classCode", authenticateJWT(), studentController.removeClass);

export default router;
