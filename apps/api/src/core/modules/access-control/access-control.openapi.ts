import {
  createAccessControlSchema,
  updateAccessControlSchema,
  accessControlBaseSchema,
  accessControlSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/access-control';
import type OpenapiService from '../openapi/openapi.service.js';
import { registerCrudOpenApi } from '../openapi/register-crud.openapi.js';

export const accessControlRoutePath = 'access-control';

export function registerAccessControlOpenApi(service: OpenapiService) {
  registerCrudOpenApi(service, {
    routePath: accessControlRoutePath,
    resource: 'access control rule',
    tag: 'Access Control',
    createSchema: createAccessControlSchema,
    updateSchema: updateAccessControlSchema,
    responseBaseSchema: accessControlBaseSchema,
    responseSchema: accessControlSchema,
    detailReturnsNotFound: false,
  });
}
