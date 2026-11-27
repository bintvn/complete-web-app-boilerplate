import { DataSource } from 'typeorm';
import { createPostModule } from './modules/post/index.js';
import createCategoryModule from './modules/category/index.js';
import type { AppConfig } from './core/types/app.types.js';
import type { AuthMiddleware } from './core/middlewares/auth.middleware.js';
import type { OpenapiModule } from './core/modules/openapi/index.js';
import createTestModule from './modules/test/index.js';

export type AppContainer = ReturnType<typeof createAppContainer>;

const createAppContainer = (
  _config: AppConfig,
  dataSource: DataSource,
  openapiModule: OpenapiModule,
  authMiddleware: AuthMiddleware
) => {
  const categoryModule = createCategoryModule(
    dataSource,
    openapiModule,
    authMiddleware
  );
  const postModule = createPostModule(
    dataSource,
    openapiModule,
    authMiddleware
  );
  const testModule = createTestModule(
    dataSource,
    openapiModule,
    authMiddleware
  );

  return {
    postModule,
    categoryModule,
    testModule,
  };
};

export default createAppContainer;
