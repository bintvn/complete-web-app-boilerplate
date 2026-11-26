import { Router } from 'express';
import type UserController from './user.controller.js';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

const createUserRouter = (
  userController: UserController,
  authMiddleware: AuthMiddleware
) => {
  const userRoutes = Router();

  userRoutes.get('/', authMiddleware, userController.getAll);
  userRoutes.get('/:id', authMiddleware, userController.get);
  userRoutes.post('/', authMiddleware, userController.create);
  userRoutes.patch('/:id', authMiddleware, userController.update);
  userRoutes.delete('/:id', authMiddleware, userController.delete);

  return userRoutes;
};

export default createUserRouter;
