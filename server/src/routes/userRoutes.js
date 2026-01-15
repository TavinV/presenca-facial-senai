import express from 'express';
import userController from '../controllers/userController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { userSchemas } from '../validations/userValidation.js';

import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router()

router.post('/', authenticateJWT("coordenador"), userController.create);

router.get('/me', authenticateJWT(), userController.getMe);
router.get('/:id', userController.getById);
router.get('/', userController.getAll);

router.patch('/me/change-password', authenticateJWT(), userController.changePassword);
router.patch('/:id', authenticateJWT(), validateRequest(userSchemas.update), userController.updateUser);
router.patch('/:id/activate', authenticateJWT("coordenador"), userController.activateUser);
router.patch('/:id/deactivate', authenticateJWT("coordenador"), userController.deactivateUser);

router.delete('/:id', authenticateJWT("coordenador"), userController.deleteUser);

export default router;
