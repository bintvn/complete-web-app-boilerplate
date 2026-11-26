import { Router } from 'express';
import type AccessControlController from './access-control.controller.js';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

const createAccessControlRouter = (
  accessControlController: AccessControlController,
  authMiddleware: AuthMiddleware
) => {
  const accessControlRoutes = Router();

  accessControlRoutes.get('/', authMiddleware, accessControlController.getAll);
  accessControlRoutes.get('/:id', authMiddleware, accessControlController.get);
  accessControlRoutes.post('/', authMiddleware, accessControlController.create);
  accessControlRoutes.patch(
    '/:id',
    authMiddleware,
    accessControlController.update
  );
  accessControlRoutes.delete(
    '/:id',
    authMiddleware,
    accessControlController.delete
  );

  return accessControlRoutes;
};

export default createAccessControlRouter;
