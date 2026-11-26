import UserController from './user.controller.js';
import UserService from './user.service.js';
import { UserEntity } from './entities/user.entity.js';
import type RoleService from '../role/role.service.js';
import type { DataSource } from 'typeorm';
import createUserRouter from './user.route.js';
import type { Module } from '../../types/module.types.js';
import type { Router } from 'express';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

export interface UserServiceDependencies {
  roleService: RoleService;
}

export interface UserModule extends Module {
  service: UserService;
  controller: UserController;
  router: Router;
}

const createUserModule = (
  dataSource: DataSource,
  dependencies: UserServiceDependencies,
  authMiddleware: AuthMiddleware
): UserModule => {
  const service = new UserService(
    dataSource.getRepository(UserEntity),
    dependencies
  );
  const controller = new UserController(service);
  const router = createUserRouter(controller, authMiddleware);

  return {
    name: 'user',
    entities: [UserEntity],
    service,
    controller,
    router,
    routePath: 'users',
  };
};

export default createUserModule;
