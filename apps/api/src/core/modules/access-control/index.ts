import type { DataSource } from 'typeorm';
import type { OpenapiModule } from '../openapi/index.js';
import {
  accessControlRoutePath,
  registerAccessControlOpenApi,
} from './access-control.openapi.js';
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
  openapiModule: OpenapiModule,
  authMiddleware: AuthMiddleware
): AccessControlModule => {
  const service = new AccessControlService(
    dataSource.getRepository(AccessControlEntity)
  );
  const controller = new AccessControlController(service);
  const router = createAccessControlRouter(controller, authMiddleware);

  registerAccessControlOpenApi(openapiModule.service);

  return {
    name: 'access-control',
    entities: [AccessControlEntity],
    service,
    controller,
    router,
    routePath: accessControlRoutePath,
  };
};

export default createAccessControlModule;
