import { Router } from 'express';
import type TestController from './test.controller.js';
import type { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';

const createTestRouter = (
  controller: TestController,
  authMiddleware: AuthMiddleware
) => {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.get);
  router.post('/', authMiddleware, controller.create);
  router.patch('/:id', authMiddleware, controller.update);
  router.delete('/:id', authMiddleware, controller.delete);

  return router;
};

export default createTestRouter;
