import {
  createRoleSchema,
  updateRoleSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/role';
import type OpenapiService from '../openapi/openapi.service.js';
import { registerCrudOpenApi } from '../openapi/register-crud.openapi.js';
import {
  roleBaseSchema,
  roleSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/role';

export const roleRoutePath = 'roles';

export function registerRoleOpenApi(service: OpenapiService) {
  registerCrudOpenApi(service, {
    routePath: roleRoutePath,
    resource: 'role',
    tag: 'Roles',
    createSchema: createRoleSchema,
    updateSchema: updateRoleSchema,
    responseBaseSchema: roleBaseSchema,
    responseSchema: roleSchema,
    detailReturnsNotFound: false,
  });
}
