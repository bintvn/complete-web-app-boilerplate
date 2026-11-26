import { Router } from 'express';
import type { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';
import type CategoryController from './category.controller.js';

const createCategoryRouter = (
  categoryController: CategoryController,
  authMiddleware: AuthMiddleware
) => {
  const postRoutes = Router();

  postRoutes.get('/', categoryController.getAll);
  postRoutes.get('/:id', categoryController.get);
  postRoutes.post('/', authMiddleware, categoryController.create);
  postRoutes.patch('/:id', authMiddleware, categoryController.update);
  postRoutes.delete('/:id', authMiddleware, categoryController.delete);

  return postRoutes;
};

export default createCategoryRouter;
