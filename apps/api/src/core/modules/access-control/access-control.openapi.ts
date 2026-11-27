import {
  createAccessControlSchema,
  accessControlResponseSchema,
  updateAccessControlSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/access-control';
import type OpenapiService from '../openapi/openapi.service.js';
import { registerCrudOpenApi } from '../openapi/register-crud.openapi.js';

export const accessControlRoutePath = 'access-control';
const responseSchema = accessControlResponseSchema.meta({
  id: 'AccessControl',
});

export function registerAccessControlOpenApi(service: OpenapiService) {
  registerCrudOpenApi(service, {
    routePath: accessControlRoutePath,
    resource: 'access control rule',
    tag: 'Access Control',
    createSchema: createAccessControlSchema,
    updateSchema: updateAccessControlSchema,
    responseSchema,
    detailReturnsNotFound: false,
  });
}
