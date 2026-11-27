import {
  createModuleSchema,
  moduleResponseSchema,
  updateModuleSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/module';
import type OpenapiService from '../openapi/openapi.service.js';
import { registerCrudOpenApi } from '../openapi/register-crud.openapi.js';

export const moduleRoutePath = 'modules';
const responseSchema = moduleResponseSchema.meta({ id: 'Module' });

export function registerModuleOpenApi(service: OpenapiService) {
  registerCrudOpenApi(service, {
    routePath: moduleRoutePath,
    resource: 'module',
    tag: 'Modules',
    createSchema: createModuleSchema,
    updateSchema: updateModuleSchema,
    responseSchema,
    detailReturnsNotFound: false,
  });
}
