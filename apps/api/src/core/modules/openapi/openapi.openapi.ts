import { openApiDocumentSchema } from '@complete-web-app-boilerplate/shared/core/modules/openapi';
import type OpenapiService from './openapi.service.js';

export function registerOpenApiDocument(service: OpenapiService) {
  service.registry.registerPath({
    method: 'get',
    path: `/openapi.json`,
    operationId: 'getOpenApiDocument',
    summary: 'Get the OpenAPI document',
    tags: ['OpenAPI'],
    security: [],
    responses: {
      200: service.jsonResponse('OpenAPI document.', openApiDocumentSchema),
      500: service.errors.internal,
    },
  });
}
