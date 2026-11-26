import { DataSource } from 'typeorm';
import { createPostModule } from './modules/post/index.js';
import createCategoryModule from './modules/category/index.js';
import type { AppConfig } from './core/types/app.types.js';
import type { AuthMiddleware } from './core/middlewares/auth.middleware.js';

export type AppContainer = ReturnType<typeof createAppContainer>;

const createAppContainer = (
  _config: AppConfig,
  dataSource: DataSource,
  authMiddleware: AuthMiddleware
) => {
  const postModule = createPostModule(dataSource, authMiddleware);
  const categoryModule = createCategoryModule(dataSource, authMiddleware);

  return {
    postModule,
    categoryModule,
  };
};

export default createAppContainer;
