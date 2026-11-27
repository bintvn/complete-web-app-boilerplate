import type { DataSource } from 'typeorm';
import { PostEntity } from './entities/post.entity.js';
import PostService from './post.service.js';
import PostController from './post.controller.js';
import createPostRouter from './post.routes.js';
import type { Module } from '../../core/types/module.types.js';
import type { Router } from 'express';
import type { AuthMiddleware } from '../../core/middlewares/auth.middleware.js';
import type { OpenapiModule } from '../../core/modules/openapi/index.js';
import { registerPostOpenApi } from './post.openapi.js';

export interface PostModule extends Module {
  service: PostService;
  controller: PostController;
  router: Router;
}

export const createPostModule = (
  dataSource: DataSource,
  openapiModule: OpenapiModule,
  authMiddleware: AuthMiddleware
): PostModule => {
  const service = new PostService(dataSource.getRepository(PostEntity));
  const controller = new PostController(service);
  const router = createPostRouter(controller, authMiddleware);

  registerPostOpenApi(openapiModule.service);

  return {
    name: 'post',
    entities: [PostEntity],
    service,
    controller,
    router,
    routePath: 'posts',
  };
};
