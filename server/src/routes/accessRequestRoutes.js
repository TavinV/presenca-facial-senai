import { Router } from "express";
import accessRequestController from "../controllers/accessRequestController.js";
import { accessRequestSchemas } from "../validations/accessRequestValidation.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.get(
    "/",
    authenticateJWT(),
    accessRequestController.getAll
);

router.get(
    "/:id",
    authenticateJWT(),
    accessRequestController.getById
);

router.get(
    "/cpf/:cpf",
    authenticateJWT(),
    accessRequestController.getByCpf
);

router.post(
    "/",
    validateRequest(accessRequestSchemas.create),
    accessRequestController.create
);

router.patch(
    "/:id/status",
    authenticateJWT(),
    validateRequest(accessRequestSchemas.update),
    accessRequestController.updateStatus
);

router.delete(
    "/:id",
    authenticateJWT(),
    accessRequestController.delete
);

export default router;