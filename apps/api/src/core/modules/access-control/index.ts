import type { DataSource } from 'typeorm';
import AccessControlController from './access-control.controller.js';
import { AccessControlEntity } from './entities/access-control.entity.js';
import createAccessControlRouter from './access-control.route.js';
import AccessControlService from './access-control.service.js';
import type { Module } from '../../types/module.types.js';
import type { Router } from 'express';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

export interface AccessControlModule extends Module {
  service: AccessControlService;
  controller: AccessControlController;
  router: Router;
}

const createAccessControlModule = (
  dataSource: DataSource,
  authMiddleware: AuthMiddleware
): AccessControlModule => {
  const service = new AccessControlService(
    dataSource.getRepository(AccessControlEntity)
  );
  const controller = new AccessControlController(service);
  const router = createAccessControlRouter(controller, authMiddleware);

  return {
    name: 'access-control',
    entities: [AccessControlEntity],
    service,
    controller,
    router,
    routePath: 'access-control',
  };
};

export default createAccessControlModule;
