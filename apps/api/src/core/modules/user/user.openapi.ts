import {
  createUserSchema,
  userResponseSchema,
  updateUserSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/user';
import type OpenapiService from '../openapi/openapi.service.js';
import { registerCrudOpenApi } from '../openapi/register-crud.openapi.js';

export const userRoutePath = 'users';
const responseSchema = userResponseSchema.meta({ id: 'User' });

export function registerUserOpenApi(service: OpenapiService) {
  registerCrudOpenApi(service, {
    routePath: userRoutePath,
    resource: 'user',
    tag: 'Users',
    createSchema: createUserSchema,
    updateSchema: updateUserSchema,
    responseSchema,
  });
}
