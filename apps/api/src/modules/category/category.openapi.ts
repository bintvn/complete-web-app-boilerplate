import { z } from 'zod';
import { patchIdSchema } from '@complete-web-app-boilerplate/shared/core/validation';
import {
  categoryResponseSchema as responseSchema,
  createCategorySchema,
  updateCategorySchema,
} from '@complete-web-app-boilerplate/shared/modules/category';
import type OpenapiService from '../../core/modules/openapi/openapi.service.js';
import {
  categoryBaseSchema,
  categorySchema,
} from '../../../../../packages/shared/dist/modules/category/fields.schema.js';

const categoryResponseSchema = responseSchema.meta({ id: 'Category' });

export function registerCategoryOpenApi(service: OpenapiService) {
  const tags = ['Categories'];
  const categoryData = z.object({ data: categoryResponseSchema });
  const id = z.object({ id: z.string() });

  service.registry.registerPath({
    method: 'get',
    path: '/categories',
    operationId: 'listCategories',
    summary: 'List categories',
    tags,
    security: [],
    responses: {
      200: {
        description: 'List of categories.',
        content: { 'application/json': { schema: categoryBaseSchema } },
      },
      500: service.errors.internal,
    },
  });

  service.registry.registerPath({
    method: 'get',
    path: '/categories/{id}',
    operationId: 'getCategory',
    summary: 'Get a category',
    tags,
    security: [],
    request: { params: id },
    responses: {
      200: {
        description: 'Category details.',
        content: { 'application/json': { schema: categorySchema } },
      },
      404: service.errors.notFound,
      500: service.errors.internal,
    },
  });

  service.registry.registerPath({
    method: 'post',
    path: '/categories',
    operationId: 'createCategory',
    summary: 'Create a category',
    tags,
    security: service.bearerSecurity,
    request: {
      body: {
        required: true,
        content: { 'application/json': { schema: createCategorySchema } },
      },
    },
    responses: {
      201: service.jsonResponse('Category created.', categoryData),
      400: service.errors.badRequest,
      401: service.errors.unauthorized,
      409: service.errors.conflict,
      413: service.errors.payloadTooLarge,
      422: service.errors.validation,
      500: service.errors.internal,
    },
  });

  service.registry.registerPath({
    method: 'patch',
    path: '/categories/{id}',
    operationId: 'updateCategory',
    summary: 'Update a category',
    tags,
    security: service.bearerSecurity,
    request: {
      params: z.object({ id: patchIdSchema }),
      body: {
        required: true,
        content: { 'application/json': { schema: updateCategorySchema } },
      },
    },
    responses: {
      204: { description: 'Request completed.' },
      400: service.errors.badRequest,
      401: service.errors.unauthorized,
      409: service.errors.conflict,
      413: service.errors.payloadTooLarge,
      422: service.errors.validation,
      500: service.errors.internal,
    },
  });

  service.registry.registerPath({
    method: 'delete',
    path: '/categories/{id}',
    operationId: 'deleteCategory',
    summary: 'Delete a category',
    tags,
    security: service.bearerSecurity,
    request: { params: id },
    responses: {
      204: { description: 'Category deleted.' },
      400: service.errors.badRequest,
      401: service.errors.unauthorized,
      404: service.errors.notFound,
      409: service.errors.conflict,
      500: service.errors.internal,
    },
  });
}
