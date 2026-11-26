import { Router } from 'express';
import type PostController from './post.controller.js';
import type { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';

const createPostRouter = (
  postController: PostController,
  authMiddleware: AuthMiddleware
) => {
  const postRoutes = Router();

  postRoutes.get('/', postController.getAll);
  postRoutes.get('/:id', authMiddleware, postController.get);
  postRoutes.post('/', authMiddleware, postController.create);
  postRoutes.patch('/:id', authMiddleware, postController.update);
  postRoutes.delete('/:id', authMiddleware, postController.delete);

  return postRoutes;
};

export default createPostRouter;
