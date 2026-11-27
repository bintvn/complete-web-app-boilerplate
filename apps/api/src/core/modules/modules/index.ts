import ModuleController from './module.controller.js';
import type { OpenapiModule } from '../openapi/index.js';
import { moduleRoutePath, registerModuleOpenApi } from './module.openapi.js';
import ModuleService from './module.service.js';
import { ModuleEntity } from './entities/module.entity.js';
import createModuleRouter from './module.route.js';
import type { DataSource } from 'typeorm';
import type { Module } from '../../types/module.types.js';
import type { Router } from 'express';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

export interface ModuleModule extends Module {
  service: ModuleService;
  controller: ModuleController;
  router: Router;
}

const createModuleModule = (
  dataSource: DataSource,
  openapiModule: OpenapiModule,
  authMiddleware: AuthMiddleware
): ModuleModule => {
  const service = new ModuleService(dataSource.getRepository(ModuleEntity));
  const controller = new ModuleController(service);
  const router = createModuleRouter(controller, authMiddleware);

  registerModuleOpenApi(openapiModule.service);

  return {
    name: 'module',
    entities: [ModuleEntity],
    service,
    controller,
    router,
    routePath: moduleRoutePath,
  };
};

export default createModuleModule;
