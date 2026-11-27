import {
  createTestSchema,
  testResponseSchema,
  updateTestSchema,
} from '@complete-web-app-boilerplate/shared/modules/test';
import type OpenapiService from '../../core/modules/openapi/openapi.service.js';
import { registerCrudOpenApi } from '../../core/modules/openapi/register-crud.openapi.js';

export const testRoutePath = 'tests';
const responseSchema = testResponseSchema.meta({ id: 'Test' });

export function registerTestOpenApi(service: OpenapiService) {
  registerCrudOpenApi(service, {
    routePath: testRoutePath,
    resource: 'test',
    tag: 'Tests',
    createSchema: createTestSchema,
    updateSchema: updateTestSchema,
    responseSchema,
  });
}
