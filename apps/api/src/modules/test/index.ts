import type { DataSource } from 'typeorm';
import { TestEntity } from './entities/test.entity.js';
import TestService from './test.service.js';
import TestController from './test.controller.js';
import createTestRouter from './test.routes.js';
import type { Module } from '../../core/types/module.types.js';
import type { Router } from 'express';
import type { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';

import type { OpenapiModule } from '../../core/modules/openapi/index.js';
import { testRoutePath, registerTestOpenApi } from './test.openapi.js';

export interface TestModule extends Module {
  service: TestService;
  controller: TestController;
  router: Router;
}

const createTestModule = (
  dataSource: DataSource,
  openapiModule: OpenapiModule,
  authMiddleware: AuthMiddleware
): TestModule => {
  const service = new TestService(dataSource.getRepository(TestEntity));
  const controller = new TestController(service);
  const router = createTestRouter(controller, authMiddleware);

  registerTestOpenApi(openapiModule.service);

  return {
    name: 'test',
    entities: [TestEntity],
    service,
    controller,
    router,
    routePath: testRoutePath,
  };
};

export default createTestModule;
