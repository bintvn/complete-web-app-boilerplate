import { z } from 'zod';
import { patchIdSchema } from '@complete-web-app-boilerplate/shared/core/validation';
import type OpenapiService from './openapi.service.js';

type CrudOpenApiOptions = {
  routePath: string;
  resource: string;
  tag: string;
  createSchema: z.ZodType;
  updateSchema: z.ZodType;
  responseBaseSchema: z.ZodType;
  responseSchema?: z.ZodType;
  detailReturnsNotFound?: boolean;
};

export function registerCrudOpenApi(
  service: OpenapiService,
  options: CrudOpenApiOptions
) {
  const {
    routePath,
    resource,
    tag,
    createSchema,
    updateSchema,
    responseBaseSchema,
    responseSchema,
    detailReturnsNotFound = true,
  } = options;
  const path = `/${routePath}`;
  const itemPath = `${path}/{id}`;
  const id = z.object({ id: z.string() });
  const tags = [tag];
  const security = service.bearerSecurity;
  const errors = service.errors;
  const commonErrors = {
    400: errors.badRequest,
    401: errors.unauthorized,
    500: errors.internal,
  };
  const writeErrors = {
    ...commonErrors,
    409: errors.conflict,
    413: errors.payloadTooLarge,
    422: errors.validation,
  };

  service.registry.registerPath({
    method: 'get',
    path,
    operationId: `list:${routePath}`,
    summary: `List ${tag.toLowerCase()}`,
    tags,
    security,
    responses: {
      200: {
        description: `List of ${tag.toLowerCase()}.`,
        content: {
          'application/json': { schema: z.array(responseBaseSchema) },
        },
      },
      ...commonErrors,
    },
  });
  service.registry.registerPath({
    method: 'get',
    path: itemPath,
    operationId: `get:${routePath}`,
    summary: `Get ${resource}`,
    tags,
    security,
    request: { params: id },
    responses: {
      200: {
        description: `Details of ${resource}.`,
        content: {
          'application/json': { schema: responseSchema ?? responseBaseSchema },
        },
      },
      ...(detailReturnsNotFound && { 404: errors.notFound }),
      ...commonErrors,
    },
  });
  service.registry.registerPath({
    method: 'post',
    path,
    operationId: `create:${routePath}`,
    summary: `Create ${resource}`,
    tags,
    security,
    request: {
      body: {
        required: true,
        content: { 'application/json': { schema: createSchema } },
      },
    },
    responses: {
      201: {
        description: `Created ${resource}.`,
        content: {
          'application/json': { schema: responseSchema ?? responseBaseSchema },
        },
      },
      ...writeErrors,
    },
  });
  service.registry.registerPath({
    method: 'patch',
    path: itemPath,
    operationId: `update:${routePath}`,
    summary: `Update ${resource}`,
    tags,
    security,
    request: {
      params: z.object({ id: patchIdSchema }),
      body: {
        required: true,
        content: { 'application/json': { schema: updateSchema } },
      },
    },
    responses: { 204: { description: 'Request completed.' }, ...writeErrors },
  });
  service.registry.registerPath({
    method: 'delete',
    path: itemPath,
    operationId: `delete:${routePath}`,
    summary: `Delete ${resource}`,
    tags,
    security,
    request: { params: id },
    responses: {
      204: { description: 'Resource deleted.' },
      404: errors.notFound,
      409: errors.conflict,
      ...commonErrors,
    },
  });
}
