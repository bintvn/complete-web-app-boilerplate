import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

export function createAuthRouter(
  authController: AuthController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  router.post('/sign-up', authController.signUp);
  router.post('/sign-in', authController.signin);
  router.post('/refresh', authController.refresh);
  router.post('/verify/email', authController.verifyEmail);
  router.post('/verify/email/resend', authController.resendEmailVerification);

  router.get('/me', authMiddleware, authController.me);
  router.get('/session', authMiddleware, authController.session);
  router.get('/sessions', authMiddleware, authController.sessions);
  router.post('/sign-out', authMiddleware, authController.signout);
  router.post('/sign-out-all', authMiddleware, authController.signoutAll);
  router.delete(
    '/sessions/:sessionId',
    authMiddleware,
    authController.revokeSession
  );
  router.post(
    '/change-password',
    authMiddleware,
    authController.changePassword
  );

  return router;
}
