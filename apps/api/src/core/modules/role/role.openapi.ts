import {
  createRoleSchema,
  roleResponseSchema,
  updateRoleSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/role';
import type OpenapiService from '../openapi/openapi.service.js';
import { registerCrudOpenApi } from '../openapi/register-crud.openapi.js';

export const roleRoutePath = 'roles';
const responseSchema = roleResponseSchema.meta({ id: 'Role' });

export function registerRoleOpenApi(service: OpenapiService) {
  registerCrudOpenApi(service, {
    routePath: roleRoutePath,
    resource: 'role',
    tag: 'Roles',
    createSchema: createRoleSchema,
    updateSchema: updateRoleSchema,
    responseSchema,
    detailReturnsNotFound: false,
  });
}
