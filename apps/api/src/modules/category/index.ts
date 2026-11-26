import type { DataSource } from 'typeorm';
import { CategoryPostEntity, CategoryEntity } from './entities/index.js';
import CategoryService from './category.service.js';
import type { Module } from '../../core/types/module.types.js';
import CategoryController from './category.controller.js';
import createCategoryRouter from './category.routes.js';
import type { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';

export interface CategoryModule extends Module {
  service: CategoryService;
}

const createCategoryModule = (
  dataSource: DataSource,
  authMiddleware: AuthMiddleware
): CategoryModule => {
  const service = new CategoryService(
    dataSource.getRepository(CategoryEntity),
    dataSource.getRepository(CategoryPostEntity)
  );
  const controller = new CategoryController(service);
  const router = createCategoryRouter(controller, authMiddleware);

  return {
    name: 'category',
    entities: [CategoryEntity, CategoryPostEntity],
    service,
    router,
    routePath: 'categories',
  };
};

export default createCategoryModule;
