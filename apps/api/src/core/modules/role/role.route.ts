import { Router } from 'express';
import type RoleController from './role.controller.js';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

const createRoleRouter = (
  roleController: RoleController,
  authMiddleware: AuthMiddleware
) => {
  const roleRoutes = Router();

  roleRoutes.get('/', authMiddleware, roleController.getAll);
  roleRoutes.get('/:id', authMiddleware, roleController.get);
  roleRoutes.post('/', authMiddleware, roleController.create);
  roleRoutes.patch('/:id', authMiddleware, roleController.update);
  roleRoutes.delete('/:id', authMiddleware, roleController.delete);

  return roleRoutes;
};

export default createRoleRouter;
