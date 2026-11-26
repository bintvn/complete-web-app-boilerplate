import { Router } from 'express';
import type ModuleController from './module.controller.js';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

const createModuleRouter = (
  moduleController: ModuleController,
  authMiddleware: AuthMiddleware
) => {
  const moduleRoutes = Router();

  moduleRoutes.get('/', authMiddleware, moduleController.getAll);
  moduleRoutes.get('/:id', authMiddleware, moduleController.get);
  moduleRoutes.post('/', authMiddleware, moduleController.create);
  moduleRoutes.patch('/:id', authMiddleware, moduleController.update);
  moduleRoutes.delete('/:id', authMiddleware, moduleController.delete);

  return moduleRoutes;
};

export default createModuleRouter;
