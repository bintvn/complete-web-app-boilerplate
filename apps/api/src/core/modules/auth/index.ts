import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { createAuthRouter } from './auth.routes.js';
import type MailService from '../mail/mail.service.js';
import type UserService from '../user/user.service.js';
import type RoleService from '../role/role.service.js';
import type SessionService from '../session/session.service.js';
import type VerificationService from '../verification/verification.service.js';
import type { Module } from '../../types/module.types.js';
import type { Router } from 'express';
import { type AuthMiddleware } from '../../middlewares/auth.middleware.js';
import type { AppConfig } from '../../types/app.types.js';

export interface AuthModuleDependencies {
  mailService: MailService;
  userService: UserService;
  roleService: RoleService;
  sessionService: SessionService;
  verificationService: VerificationService;
}

export interface AuthModule extends Module {
  service: AuthService;
  controller: AuthController;
  router: Router;
}

const createAuthModule = (
  config: AppConfig,
  dependencies: AuthModuleDependencies,
  authMiddleware: AuthMiddleware
): AuthModule => {
  const service = new AuthService(dependencies, config);
  const controller = new AuthController(config, service);
  const router = createAuthRouter(controller, authMiddleware);

  return {
    name: 'access-control',
    entities: [],
    router,
    controller,
    service,
    routePath: 'auth',
  };
};

export default createAuthModule;
