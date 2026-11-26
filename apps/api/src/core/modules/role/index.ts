import RoleController from './role.controller.js';
import RoleService from './role.service.js';
import createRoleRouter from './role.route.js';
import { RoleEntity } from './entities/role.entity.js';
import type { DataSource } from 'typeorm';
import type { Module } from '../../types/module.types.js';
import type { Router } from 'express';
import { RoleUserEntity } from './entities/role-user.entity.js';
import type { AuthMiddleware } from '../../middlewares/auth.middleware.js';

export interface RoleModule extends Module {
  service: RoleService;
  controller: RoleController;
  router: Router;
}

const createRoleModule = (
  dataSource: DataSource,
  authMiddleware: AuthMiddleware
): RoleModule => {
  const service = new RoleService(
    dataSource.getRepository(RoleEntity),
    dataSource.getRepository(RoleUserEntity)
  );
  const controller = new RoleController(service);
  const router = createRoleRouter(controller, authMiddleware);

  return {
    name: 'role',
    entities: [RoleEntity, RoleUserEntity],
    service,
    controller,
    router,
    routePath: 'roles',
  };
};

export default createRoleModule;
